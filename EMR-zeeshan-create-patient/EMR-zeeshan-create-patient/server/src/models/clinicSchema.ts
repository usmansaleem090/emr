import { pgTable, serial, text, timestamp, boolean, integer, uuid, date, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users, roles } from "./securitySchema";
import { modules } from "./securitySchema";

// Clinics table definition (simplified - removed settings fields)
export const clinics = pgTable("clinics", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  email: text("email"),
  
  // New basic info fields
  type: text("type", { enum: ['group', 'single'] }).default('single'),
  groupNpi: text("group_npi"),
  taxId: text("tax_id"),
  timeZone: text("time_zone").default('America/New_York'),
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Clinic Settings table (new table for settings fields)
export const clinicSettings = pgTable("clinic_settings", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  practiceLogo: text("practice_logo"),
  primaryColor: text("primary_color").default('#0066cc'),
  enableSmsNotifications: boolean("enable_sms_notifications").default(true),
  enableVoiceCalls: boolean("enable_voice_calls").default(false),
  reminderTimeHours: integer("reminder_time_hours").default(24),
  reminderTimeMinutes: integer("reminder_time_minutes").default(0),
  acceptedInsurances: text("accepted_insurances").array().default([]),
  enableOnlinePayments: boolean("enable_online_payments").default(false),
  stripePublicKey: text("stripe_public_key"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Locations table
export const clinicLocations = pgTable("clinic_locations", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  address: text("address").notNull(),
  hours: text("hours"), // JSON string for operating hours
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// User Locations table - links users to clinic locations
export const userLocations = pgTable("user_locations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  locationId: integer("location_id").notNull().references(() => clinicLocations.id, { onDelete: 'cascade' }),
  isPrimary: boolean("is_primary").default(false),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  status: text("status", { enum: ['active', 'inactive', 'transferred'] }).default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});
 
// Clinic Location Schedules table
export const clinicLocationSchedules = pgTable("clinic_location_schedules", {
  id: serial("id").primaryKey(),
  locationId: integer("location_id").notNull().references(() => clinicLocations.id, { onDelete: 'cascade' }),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  
  // Schedule configuration
  scheduleName: text("schedule_name").notNull(), // e.g., "Regular Hours", "Holiday Hours", "Summer Hours"
  isActive: boolean("is_active").default(true),
  effectiveFrom: date("effective_from").notNull(),
  effectiveTo: date("effective_to"), // null for ongoing schedules
  
  // Weekly schedule as JSON
  weeklySchedule: jsonb("weekly_schedule").notNull(), // JSON object with daily schedules
  
  // Additional settings
  timeZone: text("time_zone").default('America/New_York'),
  notes: text("notes"), // Additional notes about this schedule
  
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Documents table
export const clinicDocuments = pgTable('clinic_documents', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: integer('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  type: text('type', { 
    enum: ['license', 'certification', 'insurance', 'policy', 'procedure', 'contract', 'financial', 'legal', 'medical', 'administrative', 'other'] 
  }).notNull(),
  date: date('date').notNull(),
  description: text('description'),
  filepath: text('filepath').notNull(),
  uploadedBy: integer('uploaded_by').notNull().references(() => users.id),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clinic Faxes table
export const clinicFaxes = pgTable('clinic_faxes', {
  id: uuid('id').primaryKey().defaultRandom(),
  clinicId: integer('clinic_id').notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  recipient: text('recipient').notNull(),
  faxNumber: text('fax_number').notNull(),
  subject: text('subject').notNull(),
  message: text('message').notNull(),
  filepath: text('filepath').notNull(),
  status: text('status', {
    enum: ['pending', 'sent', 'delivered', 'failed', 'cancelled']
  }).notNull().default('pending'),
  sentBy: integer('sent_by').notNull().references(() => users.id),
  sentAt: timestamp('sent_at'),
  deliveredAt: timestamp('delivered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Clinic Module Assignments table
export const clinicModules = pgTable("clinic_modules", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  locationId: integer("location_id").notNull().references(() => clinicLocations.id, { onDelete: 'cascade' }),
  isPrimary: boolean("is_primary").default(false),
  assignedDate: timestamp("assigned_date").notNull().defaultNow(),
  status: text("status", { enum: ['active', 'inactive', 'transferred'] }).default('active'),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Documents table
// export const clinicDocuments = pgTable("clinic_documents", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
//   documentType: text("document_type").notNull(),
//   fileName: text("file_name").notNull(),
//   filePath: text("file_path").notNull(),
//   fileSize: integer("file_size"),
//   mimeType: text("mime_type"),
//   uploadedBy: integer("uploaded_by").references(() => users.id, { onDelete: 'set null' }),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });

// Clinic Faxes table
// export const clinicFaxes = pgTable("clinic_faxes", {
//   id: uuid("id").primaryKey().defaultRandom(),
//   clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
//   faxNumber: text("fax_number").notNull(),
//   recipientName: text("recipient_name"),
//   subject: text("subject"),
//   message: text("message"),
//   status: text("status", { enum: ['pending', 'sent', 'failed'] }).default('pending'),
//   sentAt: timestamp("sent_at"),
//   createdAt: timestamp("created_at").notNull().defaultNow(),
// });

// Medical Specialties table
export const medicalSpecialties = pgTable("medical_specialties", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Specialties table
export const clinicSpecialties = pgTable("clinic_specialties", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  specialtyId: integer("specialty_id").notNull().references(() => medicalSpecialties.id, { onDelete: 'cascade' }),
  isPrimary: boolean("is_primary").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Insurance Providers table
export const insuranceProviders = pgTable("insurance_providers", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Insurances table
export const clinicInsurances = pgTable("clinic_insurances", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  insuranceId: integer("insurance_id").notNull().references(() => insuranceProviders.id, { onDelete: 'cascade' }),
  isPrimary: boolean("is_primary").default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic Location Services table
export const clinicLocationServices = pgTable("clinic_location_services", {
  id: serial("id").primaryKey(),
  clinicId: integer("clinic_id").notNull().references(() => clinics.id, { onDelete: 'cascade' }),
  locationId: integer("location_id").notNull().references(() => clinicLocations.id, { onDelete: 'cascade' }),
  serviceName: text("service_name").notNull(),
  serviceCategory: text("service_category").notNull(),
  isActive: boolean("is_active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Clinic schemas
export const insertClinicSchema = createInsertSchema(clinics, {
  name: z.string().min(1, "Clinic name is required"),
  type: z.enum(['group', 'single']).default('single'),
}).omit({
  id: true,
  createdAt: true,
});

export const selectClinicSchema = createSelectSchema(clinics);

export const updateClinicSchema = createInsertSchema(clinics, {
  name: z.string().min(1, "Clinic name is required"),
  type: z.enum(['group', 'single']).default('single'),
}).omit({
  id: true,
  createdAt: true,
});

// Clinic Settings schemas
export const insertClinicSettingsSchema = createInsertSchema(clinicSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectClinicSettingsSchema = createSelectSchema(clinicSettings);

export const updateClinicSettingsSchema = createInsertSchema(clinicSettings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Clinic Locations schemas
export const insertClinicLocationSchema = createInsertSchema(clinicLocations, {
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
}).omit({
  id: true,
  createdAt: true,
});

export const selectClinicLocationSchema = createSelectSchema(clinicLocations);

export const updateClinicLocationSchema = createInsertSchema(clinicLocations, {
  name: z.string().min(1, "Location name is required"),
  address: z.string().min(1, "Address is required"),
}).omit({
  id: true,
  createdAt: true,
});

// User Locations schemas
export const insertUserLocationSchema = createInsertSchema(userLocations, {
  status: z.enum(['active', 'inactive', 'transferred']).default('active'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectUserLocationSchema = createSelectSchema(userLocations);

export const updateUserLocationSchema = createInsertSchema(userLocations, {
  status: z.enum(['active', 'inactive', 'transferred']).default('active'),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Clinic Documents schemas
export const insertClinicDocumentSchema = createInsertSchema(clinicDocuments, {
  documentType: z.string().min(1, "Document type is required"),
  fileName: z.string().min(1, "File name is required"),
  filePath: z.string().min(1, "File path is required"),
}).omit({
  id: true,
  createdAt: true,
});

export const selectClinicDocumentSchema = createSelectSchema(clinicDocuments);

// Clinic Faxes schemas
export const insertClinicFaxSchema = createInsertSchema(clinicFaxes, {
  faxNumber: z.string().min(1, "Fax number is required"),
  status: z.enum(['pending', 'sent', 'failed']).default('pending'),
}).omit({
  id: true,
  createdAt: true,
});

export const selectClinicFaxSchema = createSelectSchema(clinicFaxes);

// Medical Specialties schemas
export const insertMedicalSpecialtySchema = createInsertSchema(medicalSpecialties, {
  name: z.string().min(1, "Specialty name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectMedicalSpecialtySchema = createSelectSchema(medicalSpecialties);

export const updateMedicalSpecialtySchema = createInsertSchema(medicalSpecialties, {
  name: z.string().min(1, "Specialty name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Clinic Specialties schemas
export const insertClinicSpecialtySchema = createInsertSchema(clinicSpecialties, {
  specialtyId: z.number().min(1, "Specialty ID is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectClinicSpecialtySchema = createSelectSchema(clinicSpecialties);

export const updateClinicSpecialtySchema = createInsertSchema(clinicSpecialties, {
  specialtyId: z.number().min(1, "Specialty ID is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Insurance Providers schemas
export const insertInsuranceProviderSchema = createInsertSchema(insuranceProviders, {
  name: z.string().min(1, "Insurance provider name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectInsuranceProviderSchema = createSelectSchema(insuranceProviders);

export const updateInsuranceProviderSchema = createInsertSchema(insuranceProviders, {
  name: z.string().min(1, "Insurance provider name is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Clinic Insurances schemas
export const insertClinicInsuranceSchema = createInsertSchema(clinicInsurances, {
  insuranceId: z.number().min(1, "Insurance ID is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectClinicInsuranceSchema = createSelectSchema(clinicInsurances);

export const updateClinicInsuranceSchema = createInsertSchema(clinicInsurances, {
  insuranceId: z.number().min(1, "Insurance ID is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Clinic Location Services schemas
export const insertClinicLocationServiceSchema = createInsertSchema(clinicLocationServices, {
  serviceName: z.string().min(1, "Service name is required"),
  serviceCategory: z.string().min(1, "Service category is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectClinicLocationServiceSchema = createSelectSchema(clinicLocationServices);
export const insertClinicLocationScheduleSchema = createInsertSchema(clinicLocationSchedules).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateClinicLocationServiceSchema = createInsertSchema(clinicLocationServices, {
  serviceName: z.string().min(1, "Service name is required"),
  serviceCategory: z.string().min(1, "Service category is required"),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const updateClinicLocationScheduleSchema = insertClinicLocationScheduleSchema.partial();

// ===== CONSTANTS =====

// Staff position enum
export const staffPositionEnum = [
  "Staff",
  "Cleaner",
  "Receptionist",
  "MA",
  "Nurse",
  "Manager",
  "Administrator",
] as const;

// Department enum
export const departmentEnum = [
  "Administration",
  "Reception",
  "Nursing",
  "Medical",
  "Housekeeping",
  "Management",
  "Other",
] as const;

// Employment status enum
export const employmentStatusEnum = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Intern",
] as const;

// Clinic Location Schedule types
export type ClinicLocationSchedule = typeof clinicLocationSchedules.$inferSelect;
export type InsertClinicLocationSchedule = z.infer<typeof insertClinicLocationScheduleSchema>;
export type UpdateClinicLocationSchedule = z.infer<typeof updateClinicLocationScheduleSchema>;

// Clinic Staff table
export const clinicStaff = pgTable('clinic_staff', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  clinicId: integer('clinic_id')
    .notNull()
    .references(() => clinics.id, { onDelete: 'cascade' }),
  locationId: integer('location_id').references(() => clinicLocations.id, { onDelete: 'set null' }),
  employeeId: text('employee_id').unique(), // Internal employee ID
  roleId: integer('role_id')
    .notNull()
    .references(() => roles.id, { onDelete: 'cascade' }),
  department: text('department', { enum: departmentEnum }).notNull(),
  employmentStatus: text('employment_status', { enum: employmentStatusEnum })
    .notNull()
    .default('Full-time'),
  startDate: date('start_date').notNull(),
  endDate: date('end_date'), // For tracking employment end
  supervisorId: integer('supervisor_id'), // Will be set up as self-reference after table definition
  salary: text('salary'), // Store as text for flexibility
  hourlyRate: text('hourly_rate'), // For hourly employees
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactPhone: text('emergency_contact_phone'),
  emergencyContactRelation: text('emergency_contact_relation'),
  address: text('address'),
  dateOfBirth: date('date_of_birth'),
  gender: text('gender', {
    enum: ["Male", "Female", "Other", "Prefer not to say"],
  }),
  notes: text('notes'), // Additional notes about the staff member
  status: text('status').notNull().default('active'), // active, inactive, terminated
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Clinic Staff schemas
export const insertClinicStaffSchema = createInsertSchema(clinicStaff, {
  department: z.enum(departmentEnum),
  employmentStatus: z.enum(employmentStatusEnum),
  startDate: z.string().refine((date) => !isNaN(Date.parse(date)), {
    message: "Invalid date format",
  }),
  endDate: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  dateOfBirth: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: "Invalid date format",
    })
    .optional(),
  gender: z.enum(["Male", "Female", "Other", "Prefer not to say"]).optional(),
  employeeId: z.string().max(20).optional(),
  salary: z.string().max(20).optional(),
  hourlyRate: z.string().max(20).optional(),
  emergencyContactName: z.string().max(100).optional(),
  emergencyContactPhone: z.string().max(20).optional(),
  emergencyContactRelation: z.string().max(50).optional(),
  address: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectClinicStaffSchema = createSelectSchema(clinicStaff);

export const updateClinicStaffSchema = insertClinicStaffSchema.partial();

// Export types
export type Clinic = typeof clinics.$inferSelect;
export type InsertClinic = z.infer<typeof insertClinicSchema>;
export type UpdateClinic = z.infer<typeof updateClinicSchema>;

export type ClinicSettings = typeof clinicSettings.$inferSelect;
export type InsertClinicSettings = z.infer<typeof insertClinicSettingsSchema>;
export type UpdateClinicSettings = z.infer<typeof updateClinicSettingsSchema>;

export type ClinicLocation = typeof clinicLocations.$inferSelect;
export type InsertClinicLocation = z.infer<typeof insertClinicLocationSchema>;
export type UpdateClinicLocation = z.infer<typeof updateClinicLocationSchema>;

export type UserLocation = typeof userLocations.$inferSelect;
export type InsertUserLocation = z.infer<typeof insertUserLocationSchema>;
export type UpdateUserLocation = z.infer<typeof updateUserLocationSchema>;

export type ClinicDocument = typeof clinicDocuments.$inferSelect;
export type InsertClinicDocument = z.infer<typeof insertClinicDocumentSchema>;

export type ClinicFax = typeof clinicFaxes.$inferSelect;
export type InsertClinicFax = z.infer<typeof insertClinicFaxSchema>;

export type MedicalSpecialty = typeof medicalSpecialties.$inferSelect;
export type InsertMedicalSpecialty = z.infer<typeof insertMedicalSpecialtySchema>;
export type UpdateMedicalSpecialty = z.infer<typeof updateMedicalSpecialtySchema>;

export type ClinicSpecialty = typeof clinicSpecialties.$inferSelect;
export type InsertClinicSpecialty = z.infer<typeof insertClinicSpecialtySchema>;
export type UpdateClinicSpecialty = z.infer<typeof updateClinicSpecialtySchema>;

export type InsuranceProvider = typeof insuranceProviders.$inferSelect;
export type InsertInsuranceProvider = z.infer<typeof insertInsuranceProviderSchema>;
export type UpdateInsuranceProvider = z.infer<typeof updateInsuranceProviderSchema>;

export type ClinicInsurance = typeof clinicInsurances.$inferSelect;
export type InsertClinicInsurance = z.infer<typeof insertClinicInsuranceSchema>;
export type UpdateClinicInsurance = z.infer<typeof updateClinicInsuranceSchema>;

export type ClinicLocationService = typeof clinicLocationServices.$inferSelect;
export type InsertClinicLocationService = z.infer<typeof insertClinicLocationServiceSchema>;
export type UpdateClinicLocationService = z.infer<typeof updateClinicLocationServiceSchema>;

export type ClinicStaff = typeof clinicStaff.$inferSelect;
export type InsertClinicStaff = z.infer<typeof insertClinicStaffSchema>;
export type UpdateClinicStaff = z.infer<typeof updateClinicStaffSchema>; 