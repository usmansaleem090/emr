import { pgTable, serial, integer, timestamp, decimal, text } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientVitals = pgTable('patient_vitals', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Vitals Data
  date: text('date'),
  height: decimal('height', { precision: 5, scale: 2 }), // cm
  weight: decimal('weight', { precision: 5, scale: 2 }), // kg
  bmi: decimal('bmi', { precision: 4, scale: 2 }), // calculated
  bpSystolic: integer('bp_systolic'), // mmHg
  bpDiastolic: integer('bp_diastolic'), // mmHg
  pulse: integer('pulse'), // bpm
  temperature: decimal('temperature', { precision: 4, scale: 1 }), // °C
  spO2: integer('spo2'), // %
  respiratoryRate: integer('respiratory_rate'), // rpm
  painScale: integer('pain_scale'), // 0-10
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Helper function to convert number or string to number with validation
const numberOrStringToNumber = z.union([
  z.number()
    .min(0, 'Value must be positive')
    .max(999, 'Value too large'),
  z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 999;
    }, 'Value must be a valid number between 0 and 999')
    .transform(val => parseFloat(val))
]).optional().nullable();

// Helper function to convert string to decimal with validation
const stringToDecimal = z.union([
  z.number()
    .min(0, 'Value must be positive')
    .max(999.99, 'Value too large'),
  z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 999.99;
    }, 'Value must be a valid number between 0 and 999.99')
    .transform(val => parseFloat(val).toFixed(2))
]).optional().nullable();

// Helper function to convert string to temperature decimal with validation
const stringToTemperatureDecimal = z.union([
  z.number()
    .min(0, 'Value must be positive')
    .max(999.9, 'Value too large'),
  z.string()
    .refine(val => {
      const num = parseFloat(val);
      return !isNaN(num) && num >= 0 && num <= 999.9;
    }, 'Value must be a valid number between 0 and 999.9')
    .transform(val => parseFloat(val).toFixed(1))
]).optional().nullable();

// Zod schemas
export const insertPatientVitalsSchema = createInsertSchema(patientVitals, {
  date: z.string().datetime('Invalid date format').optional().nullable(),
  height: stringToDecimal,
  weight: stringToDecimal,
  bpSystolic: numberOrStringToNumber,
  bpDiastolic: numberOrStringToNumber,
  pulse: numberOrStringToNumber,
  temperature: stringToTemperatureDecimal,
  spO2: numberOrStringToNumber,
  respiratoryRate: numberOrStringToNumber,
  painScale: numberOrStringToNumber,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  bmi: true // BMI will be calculated automatically
});

export const updatePatientVitalsSchema = insertPatientVitalsSchema.partial();

// Types
export type InsertPatientVitals = z.infer<typeof insertPatientVitalsSchema>;
export type UpdatePatientVitals = z.infer<typeof updatePatientVitalsSchema>;
export type PatientVitals = typeof patientVitals.$inferSelect; 