import { pgTable, serial, integer, timestamp, text, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientClinicNotes = pgTable('patient_clinic_notes', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Clinic Note Data
  noteDate: date('note_date').notNull(),
  noteType: text('note_type', { 
    enum: ['consultation', 'follow_up', 'emergency', 'routine', 'specialist', 'lab_result', 'imaging', 'procedure', 'discharge', 'other'] 
  }).notNull(),
  noteTitle: text('note_title').notNull(),
  clinicNote: text('clinic_note').notNull(),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientClinicNotesSchema = createInsertSchema(patientClinicNotes, {
  noteDate: z.string().optional().nullable(),
  noteType: z.string().optional().nullable(),
  noteTitle: z.string().optional().nullable(),
  clinicNote: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientClinicNotesSchema = insertPatientClinicNotesSchema.partial();

// Types
export type InsertPatientClinicNotes = z.infer<typeof insertPatientClinicNotesSchema>;
export type UpdatePatientClinicNotes = z.infer<typeof updatePatientClinicNotesSchema>;
export type PatientClinicNotes = typeof patientClinicNotes.$inferSelect;

// Note type options
export const NOTE_TYPES = [
  'consultation',
  'follow_up', 
  'emergency',
  'routine',
  'specialist',
  'lab_result',
  'imaging',
  'procedure',
  'discharge',
  'other'
] as const; 