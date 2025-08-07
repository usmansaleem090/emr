import { pgTable, serial, integer, timestamp, text, date, decimal } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientDiagnostics = pgTable('patient_diagnostics', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Diagnostic Data
  date: timestamp('date').notNull().defaultNow(),
  
  // Diagnostic Type
  type: text('type', { enum: ['Lab', 'Imaging'] }).notNull(), // Lab or Imaging
  
  // Lab Results (for type = 'Lab')
  test: text('test'), // Test name (e.g., "CBC", "Glucose", "Cholesterol")
  result: text('result'), // Test result value
  referenceRange: text('reference_range'), // Normal range (e.g., "70-100 mg/dL")
  units: text('units'), // Units of measurement (e.g., "mg/dL", "mmol/L")
  flag: text('flag', { enum: ['Normal', 'High', 'Low', 'Critical High', 'Critical Low'] }), // Result flag
  lab: text('lab'), // Lab name (frontend only)
  interpretation: text('interpretation'), // Interpretation (frontend only)
  
  // Imaging (for type = 'Imaging')
  imagingType: text('imaging_type'), // Type of imaging (e.g., "X-Ray", "MRI", "CT Scan", "Ultrasound")
  bodyPart: text('body_part'), // Body part imaged (e.g., "Chest", "Abdomen", "Brain")
  findings: text('findings'), // Imaging findings/impression
  impression: text('impression'), // Impression (frontend only)
  radiologist: text('radiologist'), // Radiologist who read the study
  
  // Common Fields
  trend: text('trend', { enum: ['Improving', 'Stable', 'Worsening', 'New'] }), // Trend compared to previous
  orderDate: date('order_date'), // When the test/imaging was ordered
  resultDate: date('result_date'), // When the result was received
  orderingProvider: text('ordering_provider'), // Doctor who ordered the test/imaging
  
  // Additional Information
  notes: text('notes'), // Additional notes about the diagnostic
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientDiagnosticsSchema = createInsertSchema(patientDiagnostics, {
  date: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  test: z.string().optional().nullable(),
  result: z.string().optional().nullable(),
  referenceRange: z.string().optional().nullable(),
  units: z.string().optional().nullable(),
  flag: z.string().optional().nullable(),
  lab: z.string().optional().nullable(),
  interpretation: z.string().optional().nullable(),
  imagingType: z.string().optional().nullable(),
  bodyPart: z.string().optional().nullable(),
  findings: z.string().optional().nullable(),
  impression: z.string().optional().nullable(),
  radiologist: z.string().optional().nullable(),
  trend: z.string().optional().nullable(),
  orderDate: z.string().optional().nullable(),
  resultDate: z.string().optional().nullable(),
  orderingProvider: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientDiagnosticsSchema = insertPatientDiagnosticsSchema.partial();

// Types
export type InsertPatientDiagnostics = z.infer<typeof insertPatientDiagnosticsSchema>;
export type UpdatePatientDiagnostics = z.infer<typeof updatePatientDiagnosticsSchema>;
export type PatientDiagnostics = typeof patientDiagnostics.$inferSelect; 