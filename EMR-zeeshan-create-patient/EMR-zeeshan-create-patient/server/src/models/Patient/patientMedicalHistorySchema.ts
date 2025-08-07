import { pgTable, serial, integer, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientMedicalHistory = pgTable('patient_medical_history', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Medical History Data
  date: timestamp('date').notNull().defaultNow(),
  
  // Medical Conditions
  hypertension: boolean('hypertension').default(false),
  diabetes: boolean('diabetes').default(false),
  copd: boolean('copd').default(false),
  asthma: boolean('asthma').default(false),
  cad: boolean('cad').default(false), // Coronary Artery Disease
  chf: boolean('chf').default(false), // Congestive Heart Failure
  mi: boolean('mi').default(false), // Myocardial Infarction
  stroke: boolean('stroke').default(false),
  
  // Additional Medical History Fields (frontend only)
  allergies: text('allergies'),
  chronicConditions: text('chronic_conditions'),
  familyHistory: text('family_history'),
  currentMedications: text('current_medications'),
  previousSurgeries: text('previous_surgeries'),
  
  // Additional Medical Conditions (text field for other conditions)
  otherConditions: text('other_conditions'),
  
  // Notes
  notes: text('notes'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientMedicalHistorySchema = createInsertSchema(patientMedicalHistory, {
  date: z.string().optional().nullable(),
  otherConditions: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  chronicConditions: z.string().optional().nullable(),
  familyHistory: z.string().optional().nullable(),
  currentMedications: z.string().optional().nullable(),
  previousSurgeries: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientMedicalHistorySchema = insertPatientMedicalHistorySchema.partial();

// Types
export type InsertPatientMedicalHistory = z.infer<typeof insertPatientMedicalHistorySchema>;
export type UpdatePatientMedicalHistory = z.infer<typeof updatePatientMedicalHistorySchema>;
export type PatientMedicalHistory = typeof patientMedicalHistory.$inferSelect; 