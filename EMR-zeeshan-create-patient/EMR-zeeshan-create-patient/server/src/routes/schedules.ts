import express from 'express';
import { ScheduleDAL } from '../models/Schedule';
import { createScheduleRequestSchema, updateScheduleRequestSchema } from '../models/Schedule/scheduleSchema';
import { createResponse } from '../utils/helpers';
import { authMiddleware as authenticateToken } from '../middleware/authMiddleware';
import { z } from 'zod';

const router = express.Router();

// Get all schedules for a clinic
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { clinic_id, user_type } = req.query;
    const clinicId = clinic_id ? parseInt(clinic_id as string) : user?.clinicId;
    
    if (!clinicId) {
      return res.status(400).json(createResponse(
        false,
        'Clinic ID is required'
      ));
    }

    let schedules;
    if (user_type && (user_type === 'doctor' || user_type === 'staff')) {
      schedules = await ScheduleDAL.getSchedulesByUserType(clinicId, user_type as 'doctor' | 'staff');
    } else {
      schedules = await ScheduleDAL.getSchedulesByClinicId(clinicId);
    }
    
    res.json(createResponse(
      true,
      'Schedules retrieved successfully',
      schedules
    ));
  } catch (error: any) {
    console.error('Error fetching schedules:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch schedules',
      null,
      { error: error.message }
    ));
  }
});

// Get schedules by user ID
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { active_only } = req.query;
    
    let schedules;
    if (active_only === 'true') {
      schedules = await ScheduleDAL.getActiveSchedulesByUserId(parseInt(userId));
    } else {
      schedules = await ScheduleDAL.getSchedulesByUserId(parseInt(userId));
    }
    
    res.json(createResponse(
      true,
      'User schedules retrieved successfully',
      schedules
    ));
  } catch (error: any) {
    console.error('Error fetching user schedules:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch user schedules',
      null,
      { error: error.message }
    ));
  }
});

// Get schedules by clinic ID
router.get('/clinic/:clinicId', authenticateToken, async (req, res) => {
  try {
    const { clinicId } = req.params;
    const { active_only, user_type } = req.query;
    
    let schedules;
    if (active_only === 'true') {
      schedules = await ScheduleDAL.getActiveSchedulesByClinicId(parseInt(clinicId));
    } else if (user_type && (user_type === 'doctor' || user_type === 'staff')) {
      schedules = await ScheduleDAL.getSchedulesByUserType(parseInt(clinicId), user_type as 'doctor' | 'staff');
    } else {
      schedules = await ScheduleDAL.getSchedulesByClinicId(parseInt(clinicId));
    }
    
    res.json(createResponse(
      true,
      'Clinic schedules retrieved successfully',
      schedules
    ));
  } catch (error: any) {
    console.error('Error fetching clinic schedules:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch clinic schedules',
      null,
      { error: error.message }
    ));
  }
});

// Get schedule by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const schedule = await ScheduleDAL.getScheduleById(parseInt(id));
    
    if (!schedule) {
      return res.status(404).json(createResponse(
        false,
        'Schedule not found'
      ));
    }
    
    res.json(createResponse(
      true,
      'Schedule retrieved successfully',
      schedule
    ));
  } catch (error: any) {
    console.error('Error fetching schedule:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch schedule',
      null,
      { error: error.message }
    ));
  }
});

// Create new schedule
router.post('/', authenticateToken, async (req, res) => {
  try {
    const validatedData = createScheduleRequestSchema.parse(req.body);
    
    // Check if user already has an active schedule
    const hasActive = await ScheduleDAL.hasActiveSchedule(validatedData.userId);
    if (hasActive && validatedData.isActive) {
      return res.status(409).json(createResponse(
        false,
        'User already has an active schedule'
      ));
    }

    const schedule = await ScheduleDAL.createSchedule({
      ...validatedData,
      effectiveFrom: validatedData.effectiveFrom,
      effectiveTo: validatedData.effectiveTo || null
    });
    
    res.status(201).json(createResponse(
      true,
      'Schedule created successfully',
      schedule
    ));
  } catch (error: any) {
    console.error('Error creating schedule:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json(createResponse(
        false,
        'Validation error',
        null,
        { errors: error.errors }
      ));
    }
    
    res.status(500).json(createResponse(
      false,
      'Failed to create schedule',
      null,
      { error: error.message }
    ));
  }
});

// Update schedule
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = updateScheduleRequestSchema.parse(req.body);
    
    const updatedSchedule = await ScheduleDAL.updateSchedule(parseInt(id), {
      ...validatedData,
      effectiveFrom: validatedData.effectiveFrom,
      effectiveTo: validatedData.effectiveTo || null
    });
    
    if (!updatedSchedule) {
      return res.status(404).json(createResponse(
        false,
        'Schedule not found'
      ));
    }
    
    res.json(createResponse(
      true,
      'Schedule updated successfully',
      updatedSchedule
    ));
  } catch (error: any) {
    console.error('Error updating schedule:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json(createResponse(
        false,
        'Validation error',
        null,
        { errors: error.errors }
      ));
    }
    
    res.status(500).json(createResponse(
      false,
      'Failed to update schedule',
      null,
      { error: error.message }
    ));
  }
});

// Delete schedule
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await ScheduleDAL.deleteSchedule(parseInt(id));
    
    if (!deleted) {
      return res.status(404).json(createResponse(
        false,
        'Schedule not found'
      ));
    }
    
    res.json(createResponse(
      true,
      'Schedule deleted successfully'
    ));
  } catch (error: any) {
    console.error('Error deleting schedule:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to delete schedule',
      null,
      { error: error.message }
    ));
  }
});

// Get active schedules for current user
router.get('/my/active', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const schedules = await ScheduleDAL.getActiveSchedulesByUserId(user.id);
    
    res.json(createResponse(
      true,
      'Active schedules retrieved successfully',
      schedules
    ));
  } catch (error: any) {
    console.error('Error fetching active schedules:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch active schedules',
      null,
      { error: error.message }
    ));
  }
});

// Get all schedules for current user
router.get('/my/all', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const schedules = await ScheduleDAL.getSchedulesByUserId(user.id);
    
    res.json(createResponse(
      true,
      'All schedules retrieved successfully',
      schedules
    ));
  } catch (error: any) {
    console.error('Error fetching all schedules:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch all schedules',
      null,
      { error: error.message }
    ));
  }
});

export default router; 