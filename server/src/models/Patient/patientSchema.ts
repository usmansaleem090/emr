import { pgTable, serial, integer, text, timestamp, date } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { users } from '../securitySchema';
import { clinics } from '../clinicSchema';

export const patients = pgTable('patients', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').references(() => users.id).notNull(),
  clinicId: integer('clinic_id').references(() => clinics.id), // Made optional - patients not tied to clinics
  medicalRecordNumber: text('medical_record_number').notNull().unique(),
  emrNumber: text('emr_number').notNull().unique(), // New EMR number field with YYYYMMXXXX format
  status: text('status').notNull().default('active'), // active, inactive, discharged
  
  // Patient Bio Information
  dateOfBirth: date('date_of_birth'),
  mobilePhone: text('mobile_phone'),
  homePhone: text('home_phone'),
  gender: text('gender', { enum: ['Male', 'Female', 'Other', 'Prefer not to say'] }),
  socialSecurityNumber: text('social_security_number'),
  ethnicity: text('ethnicity'),
  race: text('race'),
  preferredLanguage: text('preferred_language').default('English'),
  
  // Address Information
  streetAddress: text('street_address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas  
export const insertPatientSchema = createInsertSchema(patients, {
  gender: z.string().optional().nullable(),
  dateOfBirth: z.string().optional().nullable(),
  mobilePhone: z.string().optional().nullable(),
  homePhone: z.string().optional().nullable(),
  socialSecurityNumber: z.string().optional().nullable(),
  ethnicity: z.string().optional().nullable(),
  race: z.string().optional().nullable(),
  preferredLanguage: z.string().optional().nullable(),
  streetAddress: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  emrNumber: true, // EMR number is auto-generated
  medicalRecordNumber: true // Medical record number is auto-generated
});

export const updatePatientSchema = insertPatientSchema.partial();

// Types
export type InsertPatient = z.infer<typeof insertPatientSchema>;
export type UpdatePatient = z.infer<typeof updatePatientSchema>;
export type Patient = typeof patients.$inferSelect;

// Patient status options
export const PATIENT_STATUS = ['active', 'inactive', 'discharged'] as const;