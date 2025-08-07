import { pgTable, serial, integer, timestamp, text, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientSurgicalHistory = pgTable('patient_surgical_history', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Surgical History Data
  date: timestamp('date').notNull().defaultNow(),
  
  // Surgery Details
  surgeryDate: date('surgery_date'), // Date when surgery was performed
  procedure: text('procedure').notNull(), // Procedure name/description
  notes: text('notes'), // Additional notes about the surgery
  // Additional frontend fields
  surgeryType: text('surgery_type'),
  surgeon: text('surgeon'),
  hospital: text('hospital'),
  complications: text('complications'),
  outcome: text('outcome'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientSurgicalHistorySchema = createInsertSchema(patientSurgicalHistory, {
  date: z.string().optional().nullable(),
  surgeryDate: z.string().optional().nullable(),
  procedure: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  surgeryType: z.string().optional().nullable(),
  surgeon: z.string().optional().nullable(),
  hospital: z.string().optional().nullable(),
  complications: z.string().optional().nullable(),
  outcome: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientSurgicalHistorySchema = insertPatientSurgicalHistorySchema.partial();

// Types
export type InsertPatientSurgicalHistory = z.infer<typeof insertPatientSurgicalHistorySchema>;
export type UpdatePatientSurgicalHistory = z.infer<typeof updatePatientSurgicalHistorySchema>;
export type PatientSurgicalHistory = typeof patientSurgicalHistory.$inferSelect; 