import { pgTable, serial, integer, text, timestamp, boolean, time, jsonb, date } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../securitySchema';
import { clinics } from '../clinicSchema';

// Day Schedule schema
const dayScheduleSchema = z.object({
  isWorkingDay: z.boolean().default(true),
  startTime: z.string().optional(), // HH:MM format
  endTime: z.string().optional(), // HH:MM format
  breaks: z.array(z.object({
    startTime: z.string(), // HH:MM format
    endTime: z.string(), // HH:MM format
    type: z.enum(['lunch', 'short'])
  })).default([])
});

// Weekly Schedule schema
const weeklyScheduleSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema
});

export const schedules = pgTable('schedules', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').references(() => clinics.id).notNull(),
  userId: integer('user_id').references(() => users.id).notNull(),
  userType: text('user_type', { enum: ['doctor', 'staff'] }).notNull(),
  
  // Weekly schedule as JSON
  weeklySchedule: jsonb('weekly_schedule').notNull(),
  
  // Additional settings
  slotDuration: integer('slot_duration'), // in minutes, for doctors
  isActive: boolean('is_active').default(true),
  effectiveFrom: date('effective_from').notNull(),
  effectiveTo: date('effective_to'), // null for ongoing schedules
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertScheduleSchema = createInsertSchema(schedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updateScheduleSchema = insertScheduleSchema.partial();

export const selectScheduleSchema = createSelectSchema(schedules);

// Types
export type InsertSchedule = z.infer<typeof insertScheduleSchema>;
export type UpdateSchedule = z.infer<typeof updateScheduleSchema>;
export type Schedule = z.infer<typeof selectScheduleSchema>;
export type DaySchedule = z.infer<typeof dayScheduleSchema>;
export type WeeklySchedule = z.infer<typeof weeklyScheduleSchema>;

// Validation schemas for API
export const createScheduleRequestSchema = z.object({
  clinicId: z.number().positive(),
  userId: z.number().positive(),
  userType: z.enum(['doctor', 'staff']),
  weeklySchedule: weeklyScheduleSchema,
  slotDuration: z.number().positive().optional(),
  isActive: z.boolean().default(true),
  effectiveFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/), // YYYY-MM-DD format
  effectiveTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional() // YYYY-MM-DD format
});

export const updateScheduleRequestSchema = createScheduleRequestSchema.partial();

export type CreateScheduleRequest = z.infer<typeof createScheduleRequestSchema>;
export type UpdateScheduleRequest = z.infer<typeof updateScheduleRequestSchema>; 