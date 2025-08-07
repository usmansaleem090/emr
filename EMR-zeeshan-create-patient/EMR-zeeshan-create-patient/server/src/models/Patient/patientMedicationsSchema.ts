import { pgTable, serial, integer, timestamp, text, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientMedications = pgTable('patient_medications', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Medication Data
  date: timestamp('date').notNull().defaultNow(),
  
  // Medication Details
  medication: text('medication').notNull(), // Medication name
  dose: text('dose'), // Dose amount (e.g., "10mg", "500mg")
  status: text('status', { enum: ['Active', 'Discontinued', 'Completed', 'On Hold'] }).default('Active'), // Medication status
  route: text('route'), // Route of administration (e.g., "Oral", "IV", "Topical")
  frequency: text('frequency'), // Frequency (e.g., "Once daily", "Twice daily", "Every 8 hours")
  startDate: date('start_date'), // When medication was started
  prescriber: text('prescriber'), // Name of the prescribing doctor
  
  // Additional Information
  notes: text('notes'), // Additional notes about the medication
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientMedicationsSchema = createInsertSchema(patientMedications, {
  date: z.string().optional().nullable(),
  medication: z.string().optional().nullable(),
  dose: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
  route: z.string().optional().nullable(),
  frequency: z.string().optional().nullable(),
  startDate: z.string().optional().nullable(),
  prescriber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientMedicationsSchema = insertPatientMedicationsSchema.partial();

// Types
export type InsertPatientMedications = z.infer<typeof insertPatientMedicationsSchema>;
export type UpdatePatientMedications = z.infer<typeof updatePatientMedicationsSchema>;
export type PatientMedications = typeof patientMedications.$inferSelect; 