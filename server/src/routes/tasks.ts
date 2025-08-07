import express from 'express';
import fs from 'fs';
import { TaskDAL } from '../models/Task';
import { insertTaskSchema, updateTaskSchema, insertTaskCommentSchema } from '../models/Task/taskSchema';
import { createResponse } from '../utils/helpers';
import { authMiddleware as authenticateToken } from '../middleware/authMiddleware';
import { upload, getFilePath, taskUpload, getTaskFilePath, getFullTaskFilePath } from '../utils/fileUpload';
import { z } from 'zod';

const router = express.Router();

// Simple in-memory cache for tasks
const tasksCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 30 * 1000; // 30 seconds cache

// Cache helper functions
const getCacheKey = (clinicId: number, assignedToMe: boolean, userId?: number) => {
  return assignedToMe ? `tasks_${clinicId}_user_${userId}` : `tasks_${clinicId}`;
};

const getCachedData = (key: string) => {
  const cached = tasksCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.data;
  }
  return null;
};

const setCachedData = (key: string, data: any) => {
  tasksCache.set(key, { data, timestamp: Date.now() });
};

const clearTasksCache = (clinicId: number) => {
  // Clear all cache entries for this clinic
  const keysToDelete: string[] = [];
  tasksCache.forEach((value, key) => {
    if (key.includes(`tasks_${clinicId}`)) {
      keysToDelete.push(key);
    }
  });
  keysToDelete.forEach(key => tasksCache.delete(key));
};

// Get all tasks for a clinic
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { clinic_id, assigned_to_me } = req.query;
    const clinicId = clinic_id ? parseInt(clinic_id as string) : user?.clinicId;
    
    if (!clinicId) {
      return res.status(400).json(createResponse(
        false,
        'Clinic ID is required'
      ));
    }

    // Check cache first
    const cacheKey = getCacheKey(clinicId, assigned_to_me === 'true', user.id);
    const cachedData = getCachedData(cacheKey);
    
    if (cachedData) {
      console.log('Tasks API - Returning cached data for clinic:', clinicId);
      return res.json(cachedData);
    }

    console.log('Tasks API - Fetching fresh data for clinic:', clinicId);
    
    let tasks;
    if (assigned_to_me === 'true') {
      tasks = await TaskDAL.getTasksAssignedToUser(user.id, clinicId);
    } else {
      tasks = await TaskDAL.getAllTasksWithDetails(clinicId);
    }
    
    const response = createResponse(
      true,
      'Tasks retrieved successfully',
      tasks
    );
    
    // Cache the response
    setCachedData(cacheKey, response);
    
    res.json(response);
  } catch (error: any) {
    console.error('Error fetching tasks:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch tasks',
      null,
      { error: error.message }
    ));
  }
});

// Get task by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const task = await TaskDAL.getTaskByIdWithDetails(parseInt(id));
    
    if (!task) {
      return res.status(404).json(createResponse(
        false,
        'Task not found'
      ));
    }
    
    res.json(createResponse(
      true,
      'Task retrieved successfully',
      task
    ));
  } catch (error: any) {
    console.error('Error fetching task:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch task',
      null,
      { error: error.message }
    ));
  }
});

/**
 * Create a new task with optional file attachments
 * Supports both JSON (no files) and FormData (with files) submissions
 */
router.post('/', authenticateToken, taskUpload.array('files', 10), async (req, res) => {
  try {
    const user = (req as any).user;
    const files = req.files as Express.Multer.File[] || [];

    // Debug: Log incoming request data
    console.log('Tasks API - Request body:', req.body);
    console.log('Tasks API - Files received:', files.length);
    console.log('Tasks API - User:', { id: user.id, clinicId: user.clinicId });
    console.log('Tasks API - Content-Type:', req.headers['content-type']);

    // Validate required fields
    if (!req.body.title) {
      console.log('Tasks API - Missing title in request');
      return res.status(400).json(createResponse(
        false,
        'Title is required',
        null,
        { errors: [{ path: ['title'], message: 'Title is required' }] }
      ));
    }

    // Prepare task data for validation
    const rawData: any = {
      title: req.body.title,
      description: req.body.description || '',
      status: req.body.status || 'open',
      priority: req.body.priority || 'medium',
      createdBy: user.id,
      clinicId: user.clinicId,
    };
    
    // Convert assignedTo to number if it exists and is not empty
    if (req.body.assignedTo && req.body.assignedTo !== '') {
      rawData.assignedTo = parseInt(req.body.assignedTo);
    }
    
    // Convert string dates to JS Date objects if they exist
    if (req.body.startDate && req.body.startDate !== '') {
      rawData.startDate = new Date(req.body.startDate);
    }
    if (req.body.dueDate && req.body.dueDate !== '') {
      rawData.dueDate = new Date(req.body.dueDate);
    }
    
    console.log('Tasks API - Prepared data for validation:', rawData);
    
    // Validate task data using Zod schema
    const validationResult = insertTaskSchema.safeParse(rawData);
    
    if (!validationResult.success) {
      console.log('Tasks API - Validation failed:', validationResult.error.errors);
      return res.status(400).json(createResponse(
        false,
        'Validation failed',
        null,
        { errors: validationResult.error.errors }
      ));
    }
    
    console.log('Tasks API - Validation successful, creating task...');
    
    // Create the task
    const newTask = await TaskDAL.createTask(validationResult.data);
    console.log('Tasks API - Task created with ID:', newTask.id);
    
    // Handle file uploads if any files were uploaded
    if (files && files.length > 0) {
      console.log('Tasks API - Processing', files.length, 'file(s)...');
      
      for (const file of files) {
        console.log('Tasks API - Processing file:', {
          originalname: file.originalname,
          size: file.size,
          mimetype: file.mimetype,
          filename: file.filename
        });
        
        await TaskDAL.addTaskAttachment({
          taskId: newTask.id,
          fileName: file.originalname,
          filePath: getTaskFilePath(file.filename),
          fileSize: file.size,
          mimeType: file.mimetype,
          uploadedBy: user.id,
        });
        
        console.log('Tasks API - File attachment created for:', file.originalname);
      }
    } else {
      console.log('Tasks API - No files to process');
    }
    
    // Get the task with attachments for response
    const taskWithAttachments = await TaskDAL.getTaskByIdWithDetails(newTask.id);
    console.log('Tasks API - Task with attachments retrieved');
    
    // Clear cache for this clinic
    clearTasksCache(user.clinicId);
    
    res.status(201).json(createResponse(
      true,
      'Task created successfully',
      taskWithAttachments
    ));
    
  } catch (error: any) {
    console.error('Tasks API - Error creating task:', error);
    console.error('Tasks API - Error stack:', error.stack);
    
    res.status(500).json(createResponse(
      false,
      'Failed to create task',
      null,
      { error: error.message }
    ));
  }
});

// Update a task
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Validate request body
    const validationResult = updateTaskSchema.safeParse(req.body);
    
    if (!validationResult.success) {
      return res.status(400).json(createResponse(
        false,
        'Validation failed',
        null,
        { errors: validationResult.error.errors }
      ));
    }
    
    const updatedTask = await TaskDAL.updateTask(parseInt(id), validationResult.data, user.id);
    
    if (!updatedTask) {
      return res.status(404).json(createResponse(
        false,
        'Task not found'
      ));
    }
    
    // Clear cache for this clinic
    clearTasksCache(user.clinicId);
    
    res.json(createResponse(
      true,
      'Task updated successfully',
      updatedTask
    ));
  } catch (error: any) {
    console.error('Error updating task:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to update task',
      null,
      { error: error.message }
    ));
  }
});

// Delete a task
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const deleted = await TaskDAL.deleteTask(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json(createResponse(
        false,
        'Task not found'
      ));
    }
    
    res.json(createResponse(
      true,
      'Task deleted successfully'
    ));
  } catch (error: any) {
    console.error('Error deleting task:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to delete task',
      null,
      { error: error.message }
    ));
  }
});

// Get task comments
router.get('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const comments = await TaskDAL.getTaskComments(parseInt(id));
    
    res.json(createResponse(
      true,
      'Task comments retrieved successfully',
      comments
    ));
  } catch (error: any) {
    console.error('Error fetching task comments:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch task comments',
      null,
      { error: error.message }
    ));
  }
});

// Add a comment to a task
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user = (req as any).user;
    
    // Validate request body
    const validationResult = insertTaskCommentSchema.safeParse({
      ...req.body,
      taskId: parseInt(id),
      commentedBy: user.id,
    });
    
    if (!validationResult.success) {
      return res.status(400).json(createResponse(
        false,
        'Validation failed',
        null,
        { errors: validationResult.error.errors }
      ));
    }
    
    const newComment = await TaskDAL.addTaskComment(validationResult.data);
    
    res.status(201).json(createResponse(
      true,
      'Comment added successfully',
      newComment
    ));
  } catch (error: any) {
    console.error('Error adding task comment:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to add comment',
      null,
      { error: error.message }
    ));
  }
});

// Get task history
router.get('/:id/history', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const history = await TaskDAL.getTaskHistory(parseInt(id));
    
    res.json(createResponse(
      true,
      'Task history retrieved successfully',
      history
    ));
  } catch (error: any) {
    console.error('Error fetching task history:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch task history',
      null,
      { error: error.message }
    ));
  }
});

// Get task statistics
router.get('/stats/:clinicId', authenticateToken, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const stats = await TaskDAL.getTaskStats(parseInt(clinicId));
    
    res.json(createResponse(
      true,
      'Task statistics retrieved successfully',
      stats
    ));
  } catch (error: any) {
    console.error('Error fetching task statistics:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch task statistics',
      null,
      { error: error.message }
    ));
  }
});

// Get assignable users for a clinic
router.get('/assignable-users/:clinicId', authenticateToken, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const users = await TaskDAL.getAssignableUsers(parseInt(clinicId));
    
    res.json(createResponse(
      true,
      'Assignable users retrieved successfully',
      users
    ));
  } catch (error: any) {
    console.error('Error fetching assignable users:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch assignable users',
      null,
      { error: error.message }
    ));
  }
});

// Download task attachment
router.get('/attachments/:attachmentId/download', authenticateToken, async (req, res) => {
  try {
    const { attachmentId } = req.params;
    const user = (req as any).user;
    
    // Get attachment details
    const attachment = await TaskDAL.getTaskAttachmentById(parseInt(attachmentId));
    
    if (!attachment) {
      return res.status(404).json(createResponse(
        false,
        'Attachment not found'
      ));
    }
    
    // Check if file exists
    const fullFilePath = getFullTaskFilePath(attachment.filePath.split('/').pop() || '');
    if (!fs.existsSync(fullFilePath)) {
      return res.status(404).json(createResponse(
        false,
        'File not found on server'
      ));
    }
    
    // Set headers for file download
    res.setHeader('Content-Type', attachment.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${attachment.fileName}"`);
    
    // Stream the file
    const fileStream = fs.createReadStream(fullFilePath);
    fileStream.pipe(res);
  } catch (error: any) {
    console.error('Error downloading attachment:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to download attachment',
      null,
      { error: error.message }
    ));
  }
});

// Update task status only
router.patch('/:id/status', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user = (req as any).user;
    
    // Validate status
    if (!status || !['open', 'in_progress', 'completed', 'closed'].includes(status)) {
      return res.status(400).json(createResponse(
        false,
        'Invalid status value. Must be one of: open, in_progress, completed, closed'
      ));
    }
    
    const updatedTask = await TaskDAL.updateTaskStatus(parseInt(id), status, user.id);
    
    if (!updatedTask) {
      return res.status(404).json(createResponse(
        false,
        'Task not found'
      ));
    }
    
    // Clear cache for this clinic
    clearTasksCache(user.clinicId);
    
    res.json(createResponse(
      true,
      'Task status updated successfully',
      updatedTask
    ));
  } catch (error: any) {
    console.error('Error updating task status:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to update task status',
      null,
      { error: error.message }
    ));
  }
});

export default router;