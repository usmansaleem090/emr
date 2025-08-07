import { pgTable, serial, text, timestamp, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "../securitySchema";
import { clinics } from "../clinicSchema";

// Task status enum
export const taskStatusEnum = ["open", "in_progress", "completed", "closed"] as const;

// Task priority enum
export const taskPriorityEnum = ["low", "medium", "high", "urgent"] as const;

// Tasks table definition
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status", { enum: taskStatusEnum }).notNull().default("open"),
  priority: text("priority", { enum: taskPriorityEnum }).notNull().default("medium"),
  createdBy: integer("created_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  assignedTo: integer("assigned_to").references(() => users.id, { onDelete: 'set null' }),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  startDate: timestamp("start_date"),
  dueDate: timestamp("due_date"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Task attachments table definition
export const taskAttachments = pgTable("task_attachments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  fileName: text("file_name").notNull(),
  filePath: text("file_path").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  uploadedBy: integer("uploaded_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Task comments table definition
export const taskComments = pgTable("task_comments", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  commentedBy: integer("commented_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  commentText: text("comment_text").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Task history table definition
export const taskHistory = pgTable("task_history", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasks.id, { onDelete: 'cascade' }),
  changedBy: integer("changed_by").notNull().references(() => users.id, { onDelete: 'cascade' }),
  action: text("action").notNull(), // 'created', 'status_changed', 'assigned', 'priority_changed', 'edited'
  fieldName: text("field_name"), // 'status', 'assignedTo', 'priority', 'title', 'description'
  oldValue: text("old_value"),
  newValue: text("new_value"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Zod schemas for tasks
export const insertTaskSchema = createInsertSchema(tasks, {
  status: z.enum(taskStatusEnum),
  priority: z.enum(taskPriorityEnum),
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
  startDate: z.coerce.date().optional(),  // 👈 allows string -> Date
  dueDate: z.coerce.date().optional(),    
});

export const updateTaskSchema = insertTaskSchema.partial().omit({ 
  createdBy: true, 
  clinicId: true,
  createdAt: true 
});

// Zod schemas for task comments
export const insertTaskCommentSchema = createInsertSchema(taskComments, {
  commentText: z.string().min(1, "Comment cannot be empty").max(1000, "Comment too long"),
});

// TypeScript types
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type UpdateTask = z.infer<typeof updateTaskSchema>;
export type Task = typeof tasks.$inferSelect;
export type InsertTaskComment = z.infer<typeof insertTaskCommentSchema>;
export type TaskComment = typeof taskComments.$inferSelect;
export type TaskHistory = typeof taskHistory.$inferSelect;

// Task attachment with user details
export interface TaskAttachmentWithUser {
  id: number;
  taskId: number;
  fileName: string;
  filePath: string;
  fileSize: number | null;
  mimeType: string | null;
  uploadedBy: number;
  createdAt: Date;
  uploadedByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

// Lightweight task attachment for list views
export interface TaskAttachmentLightweight {
  fileName: string;
  filePath: string;
}

// Task with related data (lightweight for list views)
export interface TaskWithDetails extends Task {
  createdByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  assignedToUser?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  clinic: {
    id: number;
    name: string;
  };
  commentsCount: number;
  attachments?: TaskAttachmentLightweight[];
}

// Task with full details (including full attachment data for detail views)
export interface TaskWithFullDetails extends Task {
  createdByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  assignedToUser?: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
  clinic: {
    id: number;
    name: string;
  };
  commentsCount: number;
  attachments?: TaskAttachmentWithUser[];
}

// Comment with user details
export interface TaskCommentWithUser extends TaskComment {
  user: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}

export interface TaskHistoryWithUser extends TaskHistory {
  changedByUser: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    email: string;
  };
}