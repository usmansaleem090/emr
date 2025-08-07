import { pgTable, serial, integer, date, time, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const appointments = pgTable('appointments', {
  id: serial('id').primaryKey(),
  clinicId: integer('clinic_id').notNull(),
  patientId: integer('patient_id').notNull(),
  doctorId: integer('doctor_id').notNull(),
  locationId: integer('location_id').notNull(),
  appointmentDate: date('appointment_date').notNull(),
  startTime: time('start_time').notNull(),
  endTime: time('end_time').notNull(),
  type: varchar('type', { length: 10 }).notNull().$type<'onsite' | 'online'>(),
  status: varchar('status', { length: 15 }).notNull().$type<'scheduled' | 'cancelled' | 'completed'>(),
  notes: text('notes'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow(),
});

// Create Zod schemas
export const insertAppointmentSchema = createInsertSchema(appointments, {
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Start time must be in HH:MM format'),
  endTime: z.string().regex(/^\d{2}:\d{2}$/, 'End time must be in HH:MM format'),
  type: z.enum(['onsite', 'online']),
  status: z.enum(['scheduled', 'cancelled', 'completed']),
  notes: z.string().optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectAppointmentSchema = createSelectSchema(appointments);

// TypeScript types
export type InsertAppointment = z.infer<typeof insertAppointmentSchema>;
export type SelectAppointment = typeof appointments.$inferSelect;
export type AppointmentWithDetails = SelectAppointment & {
  patientName: string;
  doctorName: string;
  locationName: string;
  clinicName: string;
};