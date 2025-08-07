import { pgTable, foreignKey, serial, integer, timestamp, date, text, boolean, numeric, unique, jsonb, varchar, uuid, time } from "drizzle-orm/pg-core"
import { sql } from "drizzle-orm"



export const patientSurgicalHistory = pgTable("patient_surgical_history", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	surgeryDate: date("surgery_date"),
	procedure: text().notNull(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_surgical_history_patient_id_patients_id_fk"
		}),
]);

export const patientMedications = pgTable("patient_medications", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	medication: text().notNull(),
	dose: text(),
	status: text().default('Active'),
	route: text(),
	frequency: text(),
	startDate: date("start_date"),
	prescriber: text(),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_medications_patient_id_patients_id_fk"
		}),
]);

export const patientDiagnostics = pgTable("patient_diagnostics", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	type: text().notNull(),
	test: text(),
	result: text(),
	referenceRange: text("reference_range"),
	units: text(),
	flag: text(),
	imagingType: text("imaging_type"),
	bodyPart: text("body_part"),
	findings: text(),
	radiologist: text(),
	trend: text(),
	orderDate: date("order_date"),
	resultDate: date("result_date"),
	orderingProvider: text("ordering_provider"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_diagnostics_patient_id_patients_id_fk"
		}),
]);

export const patientInsurance = pgTable("patient_insurance", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	insuranceType: text("insurance_type").notNull(),
	insuranceCompanyName: text("insurance_company_name").notNull(),
	insurancePlanName: text("insurance_plan_name"),
	insurancePhoneNumber: text("insurance_phone_number"),
	insuranceAddress: text("insurance_address"),
	payerId: text("payer_id"),
	memberId: text("member_id"),
	groupNumber: text("group_number"),
	planEffectiveDate: date("plan_effective_date"),
	planExpiryDate: date("plan_expiry_date"),
	relationshipToInsured: text("relationship_to_insured").default('Self'),
	insuredPersonFullName: text("insured_person_full_name"),
	insuredPersonDateOfBirth: date("insured_person_date_of_birth"),
	insuredPersonGender: text("insured_person_gender"),
	insuredPersonEmployer: text("insured_person_employer"),
	insuranceCardFront: text("insurance_card_front"),
	insuranceCardBack: text("insurance_card_back"),
	idDriverLicense: text("id_driver_license"),
	isActive: boolean("is_active").default(true),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_insurance_patient_id_patients_id_fk"
		}),
]);

export const roles = pgTable("roles", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	isPracticeRole: boolean("is_practice_role").default(false).notNull(),
});

export const patientMedicalHistory = pgTable("patient_medical_history", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: timestamp({ mode: 'string' }).defaultNow().notNull(),
	hypertension: boolean().default(false),
	diabetes: boolean().default(false),
	copd: boolean().default(false),
	asthma: boolean().default(false),
	cad: boolean().default(false),
	chf: boolean().default(false),
	mi: boolean().default(false),
	stroke: boolean().default(false),
	otherConditions: text("other_conditions"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_medical_history_patient_id_patients_id_fk"
		}),
]);

export const patientVitals = pgTable("patient_vitals", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	date: text(),
	height: numeric({ precision: 5, scale:  2 }),
	weight: numeric({ precision: 5, scale:  2 }),
	bmi: numeric({ precision: 4, scale:  2 }),
	bpSystolic: integer("bp_systolic"),
	bpDiastolic: integer("bp_diastolic"),
	pulse: integer(),
	temperature: numeric({ precision: 4, scale:  1 }),
	spo2: integer(),
	respiratoryRate: integer("respiratory_rate"),
	painScale: integer("pain_scale"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_vitals_patient_id_patients_id_fk"
		}),
]);

export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	username: text().notNull(),
	email: text().notNull(),
	passwordHash: text("password_hash").notNull(),
	userType: text("user_type").notNull(),
	clinicId: integer("clinic_id"),
	roleId: integer("role_id"),
	firstName: text("first_name"),
	lastName: text("last_name"),
	phone: text(),
	status: text().default('active').notNull(),
	lastLoginAt: timestamp("last_login_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	unique("users_email_unique").on(table.email),
]);

export const doctors = pgTable("doctors", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	clinicId: integer("clinic_id").notNull(),
	specialty: text().notNull(),
	licenseNumber: text("license_number").notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "doctors_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "doctors_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const patientClinicNotes = pgTable("patient_clinic_notes", {
	id: serial().primaryKey().notNull(),
	patientId: integer("patient_id").notNull(),
	noteDate: date("note_date").notNull(),
	noteType: text("note_type").notNull(),
	noteTitle: text("note_title").notNull(),
	clinicNote: text("clinic_note").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.patientId],
			foreignColumns: [patients.id],
			name: "patient_clinic_notes_patient_id_patients_id_fk"
		}),
]);

export const schedules = pgTable("schedules", {
	id: serial().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	userId: integer("user_id").notNull(),
	userType: text("user_type").notNull(),
	weeklySchedule: jsonb("weekly_schedule").notNull(),
	slotDuration: integer("slot_duration"),
	isActive: boolean("is_active").default(true),
	effectiveFrom: date("effective_from").notNull(),
	effectiveTo: date("effective_to"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "schedules_clinic_id_clinics_id_fk"
		}),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "schedules_user_id_users_id_fk"
		}),
]);

export const doctorTimeOff = pgTable("doctor_time_off", {
	id: serial().primaryKey().notNull(),
	doctorId: integer("doctor_id").notNull(),
	startDate: timestamp("start_date", { mode: 'string' }).notNull(),
	endDate: timestamp("end_date", { mode: 'string' }).notNull(),
	reason: varchar({ length: 255 }),
	isApproved: boolean("is_approved").default(false),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_time_off_doctor_id_doctors_id_fk"
		}).onDelete("cascade"),
]);

export const patients = pgTable("patients", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	clinicId: integer("clinic_id"),
	medicalRecordNumber: text("medical_record_number").notNull(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	emrNumber: text("emr_number").notNull(),
	dateOfBirth: date("date_of_birth"),
	mobilePhone: text("mobile_phone"),
	homePhone: text("home_phone"),
	gender: text(),
	socialSecurityNumber: text("social_security_number"),
	ethnicity: text(),
	race: text(),
	preferredLanguage: text("preferred_language").default('English'),
	streetAddress: text("street_address"),
	city: text(),
	state: text(),
	zipCode: text("zip_code"),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "patients_user_id_users_id_fk"
		}),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "patients_clinic_id_clinics_id_fk"
		}),
	unique("patients_medical_record_number_unique").on(table.medicalRecordNumber),
	unique("patients_emr_number_unique").on(table.emrNumber),
]);

export const clinicFaxes = pgTable("clinic_faxes", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	recipient: text().notNull(),
	faxNumber: text("fax_number").notNull(),
	subject: text().notNull(),
	message: text().notNull(),
	filepath: text().notNull(),
	status: text().default('pending').notNull(),
	sentBy: integer("sent_by").notNull(),
	sentAt: timestamp("sent_at", { mode: 'string' }),
	deliveredAt: timestamp("delivered_at", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_faxes_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.sentBy],
			foreignColumns: [users.id],
			name: "clinic_faxes_sent_by_users_id_fk"
		}),
]);

export const passwordResets = pgTable("password_resets", {
	id: serial().primaryKey().notNull(),
	userId: serial("user_id").notNull(),
	token: varchar({ length: 255 }).notNull(),
	isUsed: boolean("is_used").default(false).notNull(),
	expiresAt: timestamp("expires_at", { mode: 'string' }).notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "password_resets_user_id_users_id_fk"
		}),
	unique("password_resets_token_unique").on(table.token),
]);

export const appointments = pgTable("appointments", {
	id: serial().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	patientId: integer("patient_id").notNull(),
	doctorId: integer("doctor_id").notNull(),
	locationId: integer("location_id").notNull(),
	appointmentDate: date("appointment_date").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	type: varchar({ length: 10 }).notNull(),
	status: varchar({ length: 15 }).notNull(),
	notes: text(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
});

export const userAccess = pgTable("user_access", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	moduleOperationId: integer("module_operation_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "user_access_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moduleOperationId],
			foreignColumns: [moduleOperations.id],
			name: "user_access_module_operation_id_module_operations_id_fk"
		}).onDelete("cascade"),
	unique("user_access_user_id_module_operation_id_unique").on(table.userId, table.moduleOperationId),
]);

export const clinicModules = pgTable("clinic_modules", {
	id: serial().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	moduleId: integer("module_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_modules_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.moduleId],
			foreignColumns: [modules.id],
			name: "clinic_modules_module_id_modules_id_fk"
		}).onDelete("cascade"),
]);

export const clinicServices = pgTable("clinic_services", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	serviceName: text("service_name").notNull(),
	serviceCategory: text("service_category").notNull(),
	isActive: text("is_active").default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
});

export const taskComments = pgTable("task_comments", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	commentedBy: integer("commented_by").notNull(),
	commentText: text("comment_text").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_comments_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.commentedBy],
			foreignColumns: [users.id],
			name: "task_comments_commented_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const clinics = pgTable("clinics", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	address: text(),
	phone: text(),
	email: text(),
	type: text().default('single'),
	groupNpi: text("group_npi"),
	taxId: text("tax_id"),
	timeZone: text("time_zone").default('America/New_York'),
	practiceSpecialties: text("practice_specialties").array().default([""]),
	practiceLogo: text("practice_logo"),
	primaryColor: text("primary_color").default('#0066cc'),
	enableSmsNotifications: boolean("enable_sms_notifications").default(true),
	enableVoiceCalls: boolean("enable_voice_calls").default(false),
	reminderTimeHours: integer("reminder_time_hours").default(24),
	reminderTimeMinutes: integer("reminder_time_minutes").default(0),
	acceptedInsurances: text("accepted_insurances").array().default([""]),
	enableOnlinePayments: boolean("enable_online_payments").default(false),
	stripePublicKey: text("stripe_public_key"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
});

export const clinicLocations = pgTable("clinic_locations", {
	id: serial().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	name: text().notNull(),
	address: text().notNull(),
	hours: text(),
	services: text().array().default([""]),
	providers: text().array().default([""]),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_locations_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const taskAttachments = pgTable("task_attachments", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	fileName: text("file_name").notNull(),
	filePath: text("file_path").notNull(),
	fileSize: integer("file_size"),
	mimeType: text("mime_type"),
	uploadedBy: integer("uploaded_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_attachments_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "task_attachments_uploaded_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const clinicStaff = pgTable("clinic_staff", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	clinicId: integer("clinic_id").notNull(),
	locationId: integer("location_id"),
	employeeId: text("employee_id"),
	department: text().notNull(),
	employmentStatus: text("employment_status").default('Full-time').notNull(),
	startDate: date("start_date").notNull(),
	endDate: date("end_date"),
	supervisorId: integer("supervisor_id"),
	salary: text(),
	hourlyRate: text("hourly_rate"),
	emergencyContactName: text("emergency_contact_name"),
	emergencyContactPhone: text("emergency_contact_phone"),
	emergencyContactRelation: text("emergency_contact_relation"),
	address: text(),
	dateOfBirth: date("date_of_birth"),
	gender: text(),
	notes: text(),
	status: text().default('active').notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	roleId: integer("role_id").notNull(),
}, (table) => [
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "clinic_staff_user_id_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_staff_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.locationId],
			foreignColumns: [clinicLocations.id],
			name: "clinic_staff_location_id_clinic_locations_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.supervisorId],
			foreignColumns: [table.id],
			name: "clinic_staff_supervisor_id_clinic_staff_id_fk"
		}),
	foreignKey({
			columns: [table.roleId],
			foreignColumns: [roles.id],
			name: "clinic_staff_role_id_roles_id_fk"
		}).onDelete("cascade"),
	unique("clinic_staff_employee_id_unique").on(table.employeeId),
]);

export const doctorSchedules = pgTable("doctor_schedules", {
	id: serial().primaryKey().notNull(),
	doctorId: integer("doctor_id").notNull(),
	dayOfWeek: integer("day_of_week").notNull(),
	startTime: time("start_time").notNull(),
	endTime: time("end_time").notNull(),
	isActive: boolean("is_active").default(true),
	breakStartTime: time("break_start_time"),
	breakEndTime: time("break_end_time"),
	notes: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow(),
}, (table) => [
	foreignKey({
			columns: [table.doctorId],
			foreignColumns: [doctors.id],
			name: "doctor_schedules_doctor_id_doctors_id_fk"
		}).onDelete("cascade"),
]);

export const modules = pgTable("modules", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	unique("modules_name_unique").on(table.name),
]);

export const operations = pgTable("operations", {
	id: serial().primaryKey().notNull(),
	name: text().notNull(),
	description: text(),
}, (table) => [
	unique("operations_name_unique").on(table.name),
]);

export const userRoles = pgTable("user_roles", {
	id: serial().primaryKey().notNull(),
	userId: integer("user_id").notNull(),
	roleId: integer("role_id").notNull(),
});

export const rolePermissions = pgTable("role_permissions", {
	id: serial().primaryKey().notNull(),
	roleId: integer("role_id").notNull(),
	moduleOperationId: integer("module_operation_id").notNull(),
});

export const clinicDocuments = pgTable("clinic_documents", {
	id: uuid().defaultRandom().primaryKey().notNull(),
	clinicId: integer("clinic_id").notNull(),
	title: text().notNull(),
	uploadedBy: integer("uploaded_by").notNull(),
	description: text(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	type: text().notNull(),
	date: date().notNull(),
	filepath: text().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "clinic_documents_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.uploadedBy],
			foreignColumns: [users.id],
			name: "clinic_documents_uploaded_by_users_id_fk"
		}),
]);

export const moduleOperations = pgTable("module_operations", {
	id: serial().primaryKey().notNull(),
	moduleId: integer("module_id").notNull(),
	operationId: integer("operation_id").notNull(),
});

export const tasks = pgTable("tasks", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	status: text().default('open').notNull(),
	priority: text().default('medium').notNull(),
	createdBy: integer("created_by").notNull(),
	assignedTo: integer("assigned_to"),
	clinicId: integer("clinic_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
	startDate: timestamp("start_date", { mode: 'string' }),
	dueDate: timestamp("due_date", { mode: 'string' }),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "tasks_created_by_users_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.assignedTo],
			foreignColumns: [users.id],
			name: "tasks_assigned_to_users_id_fk"
		}).onDelete("set null"),
	foreignKey({
			columns: [table.clinicId],
			foreignColumns: [clinics.id],
			name: "tasks_clinic_id_clinics_id_fk"
		}).onDelete("cascade"),
]);

export const taskHistory = pgTable("task_history", {
	id: serial().primaryKey().notNull(),
	taskId: integer("task_id").notNull(),
	changedBy: integer("changed_by").notNull(),
	action: text().notNull(),
	fieldName: text("field_name"),
	oldValue: text("old_value"),
	newValue: text("new_value"),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.taskId],
			foreignColumns: [tasks.id],
			name: "task_history_task_id_tasks_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.changedBy],
			foreignColumns: [users.id],
			name: "task_history_changed_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const formTemplates = pgTable("form_templates", {
	id: serial().primaryKey().notNull(),
	title: text().notNull(),
	description: text(),
	fields: jsonb().notNull(),
	createdBy: integer("created_by").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: "form_templates_created_by_users_id_fk"
		}).onDelete("cascade"),
]);

export const formSubmissions = pgTable("form_submissions", {
	id: serial().primaryKey().notNull(),
	formTemplateId: integer("form_template_id").notNull(),
	values: jsonb().notNull(),
	userId: integer("user_id").notNull(),
	submittedAt: timestamp("submitted_at", { mode: 'string' }).defaultNow().notNull(),
}, (table) => [
	foreignKey({
			columns: [table.formTemplateId],
			foreignColumns: [formTemplates.id],
			name: "form_submissions_form_template_id_form_templates_id_fk"
		}).onDelete("cascade"),
	foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: "form_submissions_user_id_users_id_fk"
		}).onDelete("cascade"),
]);
