import { pgTable, serial, integer, timestamp, text, date, boolean } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';
import { patients } from './patientSchema';

export const patientInsurance = pgTable('patient_insurance', {
  id: serial('id').primaryKey(),
  patientId: integer('patient_id').references(() => patients.id).notNull(),
  
  // Insurance Data
  date: timestamp('date').notNull().defaultNow(),
  
  // Insurance Type
  insuranceType: text('insurance_type', { enum: ['Primary', 'Secondary', 'Tertiary'] }).notNull(),
  
  // Insurance Provider Information
  insuranceCompanyName: text('insurance_company_name').notNull(), // Insurance Company Name
  insurancePlanName: text('insurance_plan_name'), // Insurance Plan Name / Type (e.g., PPO, HMO, Medicare)
  insurancePhoneNumber: text('insurance_phone_number'), // Insurance Phone Number
  insuranceAddress: text('insurance_address'), // Insurance Address
  payerId: text('payer_id'), // Payer ID (for electronic claims)
  
  // Member/Policy Details
  memberId: text('member_id'), // Member ID / Policy Number
  groupNumber: text('group_number'), // Group Number
  planEffectiveDate: date('plan_effective_date'), // Plan Effective Date
  planExpiryDate: date('plan_expiry_date'), // Plan Expiry Date (optional)
  relationshipToInsured: text('relationship_to_insured', { enum: ['Self', 'Spouse', 'Child', 'Other'] }).default('Self'), // Relationship to Insured
  
  // Insured Person Details (if different from patient)
  insuredPersonFullName: text('insured_person_full_name'), // Insured Person's Full Name
  insuredPersonDateOfBirth: date('insured_person_date_of_birth'), // Insured Person's Date of Birth
  insuredPersonGender: text('insured_person_gender', { enum: ['Male', 'Female', 'Other', 'Prefer not to say'] }), // Insured Person's Gender
  insuredPersonEmployer: text('insured_person_employer'), // Insured Person's Employer (optional)
  
  // Upload Section (File paths/references)
  insuranceCardFront: text('insurance_card_front'), // Upload Insurance Card (Front)
  insuranceCardBack: text('insurance_card_back'), // Upload Insurance Card (Back)
  idDriverLicense: text('id_driver_license'), // Upload ID/Driver's License (if required)
  
  // Status and Additional Information
  isActive: boolean('is_active').default(true), // Whether this insurance is currently active
  notes: text('notes'), // Additional notes about the insurance
  
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow()
});

// Zod schemas
export const insertPatientInsuranceSchema = createInsertSchema(patientInsurance, {
  date: z.string().optional().nullable(),
  insuranceType: z.string().optional().nullable(),
  insuranceCompanyName: z.string().optional().nullable(),
  insurancePlanName: z.string().optional().nullable(),
  insurancePhoneNumber: z.string().optional().nullable(),
  insuranceAddress: z.string().optional().nullable(),
  payerId: z.string().optional().nullable(),
  memberId: z.string().optional().nullable(),
  groupNumber: z.string().optional().nullable(),
  planEffectiveDate: z.string().optional().nullable(),
  planExpiryDate: z.string().optional().nullable(),
  relationshipToInsured: z.string().optional().nullable(),
  insuredPersonFullName: z.string().optional().nullable(),
  insuredPersonDateOfBirth: z.string().optional().nullable(),
  insuredPersonGender: z.string().optional().nullable(),
  insuredPersonEmployer: z.string().optional().nullable(),
  insuranceCardFront: z.string().optional().nullable(),
  insuranceCardBack: z.string().optional().nullable(),
  idDriverLicense: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const updatePatientInsuranceSchema = insertPatientInsuranceSchema.partial();

// Types
export type InsertPatientInsurance = z.infer<typeof insertPatientInsuranceSchema>;
export type UpdatePatientInsurance = z.infer<typeof updatePatientInsuranceSchema>;
export type PatientInsurance = typeof patientInsurance.$inferSelect; 