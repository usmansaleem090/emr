import { pgTable, serial, integer, varchar, time, boolean, timestamp, text } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';
import { doctors } from '../Doctor/doctorSchema';

export const doctorSchedules = pgTable('doctor_schedules', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  dayOfWeek: integer('day_of_week').notNull(), // 0 = Sunday, 1 = Monday, ... 6 = Saturday
  startTime: time('start_time').notNull(), // Format: HH:MM:SS
  endTime: time('end_time').notNull(), // Format: HH:MM:SS
  isActive: boolean('is_active').default(true),
  breakStartTime: time('break_start_time'), // Optional lunch/break time
  breakEndTime: time('break_end_time'),
  notes: text('notes'), // Optional notes for the schedule
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const doctorTimeOff = pgTable('doctor_time_off', {
  id: serial('id').primaryKey(),
  doctorId: integer('doctor_id').notNull().references(() => doctors.id, { onDelete: 'cascade' }),
  startDate: timestamp('start_date').notNull(),
  endDate: timestamp('end_date').notNull(),
  reason: varchar('reason', { length: 255 }), // vacation, sick, conference, etc.
  isApproved: boolean('is_approved').default(false),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Zod schemas
export const insertDoctorScheduleSchema = createInsertSchema(doctorSchedules, {
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
  breakStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().nullable(),
  breakEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format").optional().nullable(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const updateDoctorScheduleSchema = insertDoctorScheduleSchema.partial().extend({
  id: z.number().optional(),
});

export const insertDoctorTimeOffSchema = createInsertSchema(doctorTimeOff, {
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
}).omit({ id: true, createdAt: true, updatedAt: true });

export const selectDoctorScheduleSchema = createSelectSchema(doctorSchedules);
export const selectDoctorTimeOffSchema = createSelectSchema(doctorTimeOff);

export type DoctorSchedule = typeof doctorSchedules.$inferSelect;
export type InsertDoctorSchedule = z.infer<typeof insertDoctorScheduleSchema>;
export type DoctorTimeOff = typeof doctorTimeOff.$inferSelect;
export type InsertDoctorTimeOff = z.infer<typeof insertDoctorTimeOffSchema>;

// Helper constants
export const DAYS_OF_WEEK = [
  { value: 0, label: 'Sunday', short: 'Sun' },
  { value: 1, label: 'Monday', short: 'Mon' },
  { value: 2, label: 'Tuesday', short: 'Tue' },
  { value: 3, label: 'Wednesday', short: 'Wed' },
  { value: 4, label: 'Thursday', short: 'Thu' },
  { value: 5, label: 'Friday', short: 'Fri' },
  { value: 6, label: 'Saturday', short: 'Sat' },
];

export const TIME_OFF_REASONS = [
  'Vacation',
  'Sick Leave',
  'Conference',
  'Training',
  'Personal',
  'Emergency',
  'Other'
];