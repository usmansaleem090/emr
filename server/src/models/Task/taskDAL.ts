import { db } from "../../../db";
import {
  tasks,
  taskComments,
  taskAttachments,
  taskHistory,
  type InsertTask,
  type UpdateTask,
  type InsertTaskComment,
  type TaskWithDetails,
  type TaskWithFullDetails,
  type TaskCommentWithUser,
  type TaskAttachmentWithUser,
  type TaskHistoryWithUser,
  taskStatusEnum,
} from "./taskSchema";
import { users } from "../securitySchema";
import { clinics } from "../clinicSchema";
import { eq, and, desc, sql, count, inArray } from "drizzle-orm";

export class TaskDAL {
  // Get all tasks for a clinic with details (optimized single query)
  static async getAllTasksWithDetails(
    clinicId: number
  ): Promise<TaskWithDetails[]> {
    // Single optimized query with all necessary joins
    const tasksWithDetails = await db
      .select({
        // Task fields
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        createdBy: tasks.createdBy,
        assignedTo: tasks.assignedTo,
        clinicId: tasks.clinicId,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,

        // Created by user
        createdByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },

        // Clinic
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },

        // Comment count
        commentsCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${taskComments} 
          WHERE ${taskComments.taskId} = ${tasks.id}
        )`,

        // Attachment count
        attachmentsCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${taskAttachments} 
          WHERE ${taskAttachments.taskId} = ${tasks.id}
        )`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .leftJoin(clinics, eq(tasks.clinicId, clinics.id))
      .where(eq(tasks.clinicId, clinicId))
      .orderBy(desc(tasks.createdAt));

    // Get assigned users in a separate optimized query
    const assignedUserIds = tasksWithDetails
      .map((task) => task.assignedTo)
      .filter((id) => id !== null) as number[];

    let assignedUsers: { [key: number]: any } = {};
    if (assignedUserIds.length > 0) {
      const assignedUsersData = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(inArray(users.id, assignedUserIds));

      assignedUsers = assignedUsersData.reduce((acc, user) => {
        acc[user.id] = user;
        return acc;
      }, {} as { [key: number]: any });
    }

    // Get attachments for tasks that have them
    const tasksWithAttachments = tasksWithDetails.filter(
      (task) => task.attachmentsCount > 0
    );
    let attachmentsMap: {
      [key: number]: { fileName: string; filePath: string }[];
    } = {};

    if (tasksWithAttachments.length > 0) {
      const taskIds = tasksWithAttachments.map((task) => task.id);
      const allAttachments = await db
        .select({
          taskId: taskAttachments.taskId,
          fileName: taskAttachments.fileName,
          filePath: taskAttachments.filePath,
        })
        .from(taskAttachments)
        .where(inArray(taskAttachments.taskId, taskIds))
        .orderBy(desc(taskAttachments.createdAt));

      // Group attachments by taskId
      attachmentsMap = allAttachments.reduce((acc, attachment) => {
        if (!acc[attachment.taskId]) {
          acc[attachment.taskId] = [];
        }
        acc[attachment.taskId].push({
          fileName: attachment.fileName,
          filePath: attachment.filePath,
        });
        return acc;
      }, {} as { [key: number]: { fileName: string; filePath: string }[] });
    }

    // Transform to match interface
    const result: TaskWithDetails[] = tasksWithDetails.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      createdBy: item.createdBy,
      assignedTo: item.assignedTo,
      clinicId: item.clinicId,
      startDate: item.startDate,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdByUser: item.createdByUser || {
        id: item.createdBy,
        firstName: null,
        lastName: null,
        email: "Unknown User",
      },
      assignedToUser: item.assignedTo
        ? assignedUsers[item.assignedTo]
        : undefined,
      clinic: item.clinic || {
        id: item.clinicId,
        name: "Unknown Clinic",
      },
      commentsCount: item.commentsCount || 0,
      attachments: attachmentsMap[item.id] || undefined,
    }));

    return result;
  }

  // Get task by ID with details
  static async getTaskByIdWithDetails(
    taskId: number
  ): Promise<TaskWithFullDetails | null> {
    const result = await db
      .select({
        task: tasks,
        createdByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .leftJoin(clinics, eq(tasks.clinicId, clinics.id))
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!result[0]) return null;

    const item = result[0];
    let assignedToUser = undefined;

    if (item.task.assignedTo) {
      const assignedUser = await db
        .select({
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        })
        .from(users)
        .where(eq(users.id, item.task.assignedTo))
        .limit(1);

      assignedToUser = assignedUser[0];
    }

    // Get comment count
    const commentCount = await db
      .select({ count: count() })
      .from(taskComments)
      .where(eq(taskComments.taskId, item.task.id));

    // Get attachments (full version for detail view)
    const attachments = await this.getTaskAttachments(item.task.id);

    return {
      ...item.task,
      createdByUser: item.createdByUser || {
        id: item.task.createdBy,
        firstName: null,
        lastName: null,
        email: "Unknown User",
      },
      assignedToUser,
      clinic: item.clinic || {
        id: item.task.clinicId,
        name: "Unknown Clinic",
      },
      commentsCount: commentCount[0]?.count || 0,
      attachments,
    };
  }

  // Create a new task
  static async createTask(taskData: InsertTask): Promise<TaskWithDetails> {
    const [newTask] = await db
      .insert(tasks)
      .values({
        ...taskData,
        updatedAt: new Date(),
      })
      .returning();

    // Log task creation history
    await this.addTaskHistoryEntry({
      taskId: newTask.id,
      changedBy: taskData.createdBy,
      action: "created",
    });

    const taskWithDetails = await this.getTaskByIdWithDetails(newTask.id);
    if (!taskWithDetails) {
      throw new Error("Failed to retrieve created task");
    }

    return taskWithDetails;
  }

  // Update a task
  static async updateTask(
    taskId: number,
    updateData: UpdateTask,
    changedBy: number
  ): Promise<TaskWithDetails | null> {
    // Get current task data to compare changes
    const currentTask = await db
      .select()
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!currentTask[0]) return null;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) return null;

    // Log changes to history
    const changes = [];
    if (
      updateData.title !== undefined &&
      updateData.title !== currentTask[0].title
    ) {
      changes.push({
        fieldName: "title",
        oldValue: currentTask[0].title,
        newValue: updateData.title,
      });
    }
    if (
      updateData.description !== undefined &&
      updateData.description !== currentTask[0].description
    ) {
      changes.push({
        fieldName: "description",
        oldValue: currentTask[0].description || "",
        newValue: updateData.description || "",
      });
    }
    if (
      updateData.priority !== undefined &&
      updateData.priority !== currentTask[0].priority
    ) {
      changes.push({
        fieldName: "priority",
        oldValue: currentTask[0].priority,
        newValue: updateData.priority,
      });
    }
    if (
      updateData.assignedTo !== undefined &&
      updateData.assignedTo !== currentTask[0].assignedTo
    ) {
      changes.push({
        fieldName: "assignedTo",
        oldValue: currentTask[0].assignedTo?.toString() || "",
        newValue: updateData.assignedTo?.toString() || "",
      });
    }
    if (
      updateData.startDate !== undefined &&
      updateData.startDate?.getTime() !== currentTask[0].startDate?.getTime()
    ) {
      changes.push({
        fieldName: "startDate",
        oldValue: currentTask[0].startDate?.toISOString() || "",
        newValue: updateData.startDate?.toISOString() || "",
      });
    }
    if (
      updateData.dueDate !== undefined &&
      updateData.dueDate?.getTime() !== currentTask[0].dueDate?.getTime()
    ) {
      changes.push({
        fieldName: "dueDate",
        oldValue: currentTask[0].dueDate?.toISOString() || "",
        newValue: updateData.dueDate?.toISOString() || "",
      });
    }

    // Log each change
    for (const change of changes) {
      await this.addTaskHistoryEntry({
        taskId,
        changedBy,
        action: "edited",
        fieldName: change.fieldName,
        oldValue: change.oldValue,
        newValue: change.newValue,
      });
    }

    return await this.getTaskByIdWithDetails(taskId);
  }

  // Update task status only
  static async updateTaskStatus(
    taskId: number,
    status: (typeof taskStatusEnum)[number],
    changedBy: number
  ): Promise<TaskWithDetails | null> {
    // Get current status
    const currentTask = await db
      .select({ status: tasks.status })
      .from(tasks)
      .where(eq(tasks.id, taskId))
      .limit(1);

    if (!currentTask[0]) return null;

    const [updatedTask] = await db
      .update(tasks)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(tasks.id, taskId))
      .returning();

    if (!updatedTask) return null;

    // Log status change if it actually changed
    if (currentTask[0].status !== status) {
      await this.addTaskHistoryEntry({
        taskId,
        changedBy,
        action: "status_changed",
        fieldName: "status",
        oldValue: currentTask[0].status,
        newValue: status,
      });
    }

    return await this.getTaskByIdWithDetails(taskId);
  }

  // Delete a task
  static async deleteTask(taskId: number): Promise<boolean> {
    const result = await db
      .delete(tasks)
      .where(eq(tasks.id, taskId))
      .returning({ id: tasks.id });

    return result.length > 0;
  }

  // Get tasks assigned to a specific user (optimized)
  static async getTasksAssignedToUser(
    userId: number,
    clinicId: number
  ): Promise<TaskWithDetails[]> {
    const userTasks = await db
      .select({
        // Task fields
        id: tasks.id,
        title: tasks.title,
        description: tasks.description,
        status: tasks.status,
        priority: tasks.priority,
        createdBy: tasks.createdBy,
        assignedTo: tasks.assignedTo,
        clinicId: tasks.clinicId,
        startDate: tasks.startDate,
        dueDate: tasks.dueDate,
        createdAt: tasks.createdAt,
        updatedAt: tasks.updatedAt,

        // Created by user
        createdByUser: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },

        // Clinic
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },

        // Comment count
        commentsCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${taskComments} 
          WHERE ${taskComments.taskId} = ${tasks.id}
        )`,

        // Attachment count
        attachmentsCount: sql<number>`(
          SELECT COUNT(*)::int 
          FROM ${taskAttachments} 
          WHERE ${taskAttachments.taskId} = ${tasks.id}
        )`,
      })
      .from(tasks)
      .leftJoin(users, eq(tasks.createdBy, users.id))
      .leftJoin(clinics, eq(tasks.clinicId, clinics.id))
      .where(and(eq(tasks.assignedTo, userId), eq(tasks.clinicId, clinicId)))
      .orderBy(desc(tasks.createdAt));

    // Get assigned user data (same user for all tasks)
    const assignedUser = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    // Get attachments for tasks that have them
    const tasksWithAttachments = userTasks.filter(
      (task) => task.attachmentsCount > 0
    );
    let attachmentsMap: {
      [key: number]: { fileName: string; filePath: string }[];
    } = {};

    if (tasksWithAttachments.length > 0) {
      const taskIds = tasksWithAttachments.map((task) => task.id);
      const allAttachments = await db
        .select({
          taskId: taskAttachments.taskId,
          fileName: taskAttachments.fileName,
          filePath: taskAttachments.filePath,
        })
        .from(taskAttachments)
        .where(inArray(taskAttachments.taskId, taskIds))
        .orderBy(desc(taskAttachments.createdAt));

      // Group attachments by taskId
      attachmentsMap = allAttachments.reduce((acc, attachment) => {
        if (!acc[attachment.taskId]) {
          acc[attachment.taskId] = [];
        }
        acc[attachment.taskId].push({
          fileName: attachment.fileName,
          filePath: attachment.filePath,
        });
        return acc;
      }, {} as { [key: number]: { fileName: string; filePath: string }[] });
    }

    const result: TaskWithDetails[] = userTasks.map((item) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      status: item.status,
      priority: item.priority,
      createdBy: item.createdBy,
      assignedTo: item.assignedTo,
      clinicId: item.clinicId,
      startDate: item.startDate,
      dueDate: item.dueDate,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      createdByUser: item.createdByUser!,
      assignedToUser: assignedUser[0],
      clinic: item.clinic!,
      commentsCount: item.commentsCount || 0,
      attachments: attachmentsMap[item.id] || undefined,
    }));

    return result;
  }

  // Get task comments with user details
  static async getTaskComments(taskId: number): Promise<TaskCommentWithUser[]> {
    const comments = await db
      .select({
        comment: taskComments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskComments)
      .leftJoin(users, eq(taskComments.commentedBy, users.id))
      .where(eq(taskComments.taskId, taskId))
      .orderBy(desc(taskComments.createdAt));

    return comments.map((item) => ({
      ...item.comment,
      user: item.user!,
    }));
  }

  // Add a comment to a task
  static async addTaskComment(
    commentData: InsertTaskComment
  ): Promise<TaskCommentWithUser> {
    const [newComment] = await db
      .insert(taskComments)
      .values(commentData)
      .returning();

    const commentWithUser = await db
      .select({
        comment: taskComments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskComments)
      .leftJoin(users, eq(taskComments.commentedBy, users.id))
      .where(eq(taskComments.id, newComment.id))
      .limit(1);

    return {
      ...commentWithUser[0].comment,
      user: commentWithUser[0].user!,
    };
  }

  // Get task statistics for a clinic
  static async getTaskStats(clinicId: number) {
    const stats = await db
      .select({
        status: tasks.status,
        priority: tasks.priority,
        count: count(),
      })
      .from(tasks)
      .where(eq(tasks.clinicId, clinicId))
      .groupBy(tasks.status, tasks.priority);

    const statusStats = {
      open: 0,
      in_progress: 0,
      completed: 0,
      closed: 0,
    };

    const priorityStats = {
      low: 0,
      medium: 0,
      high: 0,
      urgent: 0,
    };

    stats.forEach((stat) => {
      statusStats[stat.status as keyof typeof statusStats] += stat.count;
      priorityStats[stat.priority as keyof typeof priorityStats] += stat.count;
    });

    const totalTasks = Object.values(statusStats).reduce(
      (sum, count) => sum + count,
      0
    );

    return {
      total: totalTasks,
      byStatus: statusStats,
      byPriority: priorityStats,
    };
  }

  // Get assignable users for a clinic (all users in the clinic)
  static async getAssignableUsers(clinicId: number) {
    return await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        userType: users.userType,
      })
      .from(users)
      .where(eq(users.clinicId, clinicId))
      .orderBy(users.firstName, users.lastName);
  }

  // Get task attachments
  static async getTaskAttachments(
    taskId: number
  ): Promise<TaskAttachmentWithUser[]> {
    const attachments = await db
      .select({
        attachment: taskAttachments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskAttachments)
      .leftJoin(users, eq(taskAttachments.uploadedBy, users.id))
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));

    return attachments.map((item) => ({
      ...item.attachment,
      uploadedByUser: item.user!,
    }));
  }

  // Get task attachments (lightweight version for list views)
  static async getTaskAttachmentsLightweight(
    taskId: number
  ): Promise<{ fileName: string; filePath: string }[]> {
    const attachments = await db
      .select({
        fileName: taskAttachments.fileName,
        filePath: taskAttachments.filePath,
      })
      .from(taskAttachments)
      .where(eq(taskAttachments.taskId, taskId))
      .orderBy(desc(taskAttachments.createdAt));

    return attachments;
  }

  // Get single task attachment by ID
  static async getTaskAttachmentById(
    attachmentId: number
  ): Promise<TaskAttachmentWithUser | null> {
    const result = await db
      .select({
        attachment: taskAttachments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskAttachments)
      .leftJoin(users, eq(taskAttachments.uploadedBy, users.id))
      .where(eq(taskAttachments.id, attachmentId))
      .limit(1);

    if (!result[0]) return null;

    return {
      ...result[0].attachment,
      uploadedByUser: result[0].user!,
    };
  }

  // Add task attachment
  static async addTaskAttachment(attachmentData: {
    taskId: number;
    fileName: string;
    filePath: string;
    fileSize?: number;
    mimeType?: string;
    uploadedBy: number;
  }): Promise<TaskAttachmentWithUser> {
    const [newAttachment] = await db
      .insert(taskAttachments)
      .values(attachmentData)
      .returning();

    const attachmentWithUser = await db
      .select({
        attachment: taskAttachments,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskAttachments)
      .leftJoin(users, eq(taskAttachments.uploadedBy, users.id))
      .where(eq(taskAttachments.id, newAttachment.id))
      .limit(1);

    return {
      ...attachmentWithUser[0].attachment,
      uploadedByUser: attachmentWithUser[0].user!,
    };
  }

  // Get task history
  static async getTaskHistory(taskId: number): Promise<TaskHistoryWithUser[]> {
    const history = await db
      .select({
        history: taskHistory,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskHistory)
      .leftJoin(users, eq(taskHistory.changedBy, users.id))
      .where(eq(taskHistory.taskId, taskId))
      .orderBy(desc(taskHistory.createdAt));

    return history.map((item) => ({
      ...item.history,
      changedByUser: item.user!,
    }));
  }

  // Add task history entry
  static async addTaskHistoryEntry(historyData: {
    taskId: number;
    changedBy: number;
    action: string;
    fieldName?: string;
    oldValue?: string;
    newValue?: string;
  }): Promise<TaskHistoryWithUser> {
    const [newHistory] = await db
      .insert(taskHistory)
      .values(historyData)
      .returning();

    const historyWithUser = await db
      .select({
        history: taskHistory,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
        },
      })
      .from(taskHistory)
      .leftJoin(users, eq(taskHistory.changedBy, users.id))
      .where(eq(taskHistory.id, newHistory.id))
      .limit(1);

    return {
      ...historyWithUser[0].history,
      changedByUser: historyWithUser[0].user!,
    };
  }
}
