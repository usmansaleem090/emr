import { relations } from "drizzle-orm/relations";
import { patients, patientSurgicalHistory, patientMedications, patientDiagnostics, patientInsurance, patientMedicalHistory, patientVitals, users, doctors, clinics, patientClinicNotes, schedules, doctorTimeOff, clinicFaxes, passwordResets, userAccess, moduleOperations, clinicModules, modules, tasks, taskComments, clinicLocations, taskAttachments, clinicStaff, roles, doctorSchedules, clinicDocuments, taskHistory } from "./schema";

export const patientSurgicalHistoryRelations = relations(patientSurgicalHistory, ({one}) => ({
	patient: one(patients, {
		fields: [patientSurgicalHistory.patientId],
		references: [patients.id]
	}),
}));

export const patientsRelations = relations(patients, ({one, many}) => ({
	patientSurgicalHistories: many(patientSurgicalHistory),
	patientMedications: many(patientMedications),
	patientDiagnostics: many(patientDiagnostics),
	patientInsurances: many(patientInsurance),
	patientMedicalHistories: many(patientMedicalHistory),
	patientVitals: many(patientVitals),
	patientClinicNotes: many(patientClinicNotes),
	user: one(users, {
		fields: [patients.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [patients.clinicId],
		references: [clinics.id]
	}),
}));

export const patientMedicationsRelations = relations(patientMedications, ({one}) => ({
	patient: one(patients, {
		fields: [patientMedications.patientId],
		references: [patients.id]
	}),
}));

export const patientDiagnosticsRelations = relations(patientDiagnostics, ({one}) => ({
	patient: one(patients, {
		fields: [patientDiagnostics.patientId],
		references: [patients.id]
	}),
}));

export const patientInsuranceRelations = relations(patientInsurance, ({one}) => ({
	patient: one(patients, {
		fields: [patientInsurance.patientId],
		references: [patients.id]
	}),
}));

export const patientMedicalHistoryRelations = relations(patientMedicalHistory, ({one}) => ({
	patient: one(patients, {
		fields: [patientMedicalHistory.patientId],
		references: [patients.id]
	}),
}));

export const patientVitalsRelations = relations(patientVitals, ({one}) => ({
	patient: one(patients, {
		fields: [patientVitals.patientId],
		references: [patients.id]
	}),
}));

export const doctorsRelations = relations(doctors, ({one, many}) => ({
	user: one(users, {
		fields: [doctors.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [doctors.clinicId],
		references: [clinics.id]
	}),
	doctorTimeOffs: many(doctorTimeOff),
	doctorSchedules: many(doctorSchedules),
}));

export const usersRelations = relations(users, ({many}) => ({
	doctors: many(doctors),
	schedules: many(schedules),
	patients: many(patients),
	clinicFaxes: many(clinicFaxes),
	passwordResets: many(passwordResets),
	userAccesses: many(userAccess),
	taskComments: many(taskComments),
	taskAttachments: many(taskAttachments),
	clinicStaffs: many(clinicStaff),
	clinicDocuments: many(clinicDocuments),
	tasks_createdBy: many(tasks, {
		relationName: "tasks_createdBy_users_id"
	}),
	tasks_assignedTo: many(tasks, {
		relationName: "tasks_assignedTo_users_id"
	}),
	taskHistories: many(taskHistory),
}));

export const clinicsRelations = relations(clinics, ({many}) => ({
	doctors: many(doctors),
	schedules: many(schedules),
	patients: many(patients),
	clinicFaxes: many(clinicFaxes),
	clinicModules: many(clinicModules),
	clinicLocations: many(clinicLocations),
	clinicStaffs: many(clinicStaff),
	clinicDocuments: many(clinicDocuments),
	tasks: many(tasks),
}));

export const patientClinicNotesRelations = relations(patientClinicNotes, ({one}) => ({
	patient: one(patients, {
		fields: [patientClinicNotes.patientId],
		references: [patients.id]
	}),
}));

export const schedulesRelations = relations(schedules, ({one}) => ({
	clinic: one(clinics, {
		fields: [schedules.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [schedules.userId],
		references: [users.id]
	}),
}));

export const doctorTimeOffRelations = relations(doctorTimeOff, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorTimeOff.doctorId],
		references: [doctors.id]
	}),
}));

export const clinicFaxesRelations = relations(clinicFaxes, ({one}) => ({
	clinic: one(clinics, {
		fields: [clinicFaxes.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [clinicFaxes.sentBy],
		references: [users.id]
	}),
}));

export const passwordResetsRelations = relations(passwordResets, ({one}) => ({
	user: one(users, {
		fields: [passwordResets.userId],
		references: [users.id]
	}),
}));

export const userAccessRelations = relations(userAccess, ({one}) => ({
	user: one(users, {
		fields: [userAccess.userId],
		references: [users.id]
	}),
	moduleOperation: one(moduleOperations, {
		fields: [userAccess.moduleOperationId],
		references: [moduleOperations.id]
	}),
}));

export const moduleOperationsRelations = relations(moduleOperations, ({many}) => ({
	userAccesses: many(userAccess),
}));

export const clinicModulesRelations = relations(clinicModules, ({one}) => ({
	clinic: one(clinics, {
		fields: [clinicModules.clinicId],
		references: [clinics.id]
	}),
	module: one(modules, {
		fields: [clinicModules.moduleId],
		references: [modules.id]
	}),
}));

export const modulesRelations = relations(modules, ({many}) => ({
	clinicModules: many(clinicModules),
}));

export const taskCommentsRelations = relations(taskComments, ({one}) => ({
	task: one(tasks, {
		fields: [taskComments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskComments.commentedBy],
		references: [users.id]
	}),
}));

export const tasksRelations = relations(tasks, ({one, many}) => ({
	taskComments: many(taskComments),
	taskAttachments: many(taskAttachments),
	user_createdBy: one(users, {
		fields: [tasks.createdBy],
		references: [users.id],
		relationName: "tasks_createdBy_users_id"
	}),
	user_assignedTo: one(users, {
		fields: [tasks.assignedTo],
		references: [users.id],
		relationName: "tasks_assignedTo_users_id"
	}),
	clinic: one(clinics, {
		fields: [tasks.clinicId],
		references: [clinics.id]
	}),
	taskHistories: many(taskHistory),
}));

export const clinicLocationsRelations = relations(clinicLocations, ({one}) => ({
	clinic: one(clinics, {
		fields: [clinicLocations.clinicId],
		references: [clinics.id]
	}),
}));

export const taskAttachmentsRelations = relations(taskAttachments, ({one}) => ({
	task: one(tasks, {
		fields: [taskAttachments.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskAttachments.uploadedBy],
		references: [users.id]
	}),
}));

export const clinicStaffRelations = relations(clinicStaff, ({one, many}) => ({
	user: one(users, {
		fields: [clinicStaff.userId],
		references: [users.id]
	}),
	clinic: one(clinics, {
		fields: [clinicStaff.clinicId],
		references: [clinics.id]
	}),
	location: one(clinicLocations, {
		fields: [clinicStaff.locationId],
		references: [clinicLocations.id]
	}),
	clinicStaff: one(clinicStaff, {
		fields: [clinicStaff.supervisorId],
		references: [clinicStaff.id],
		relationName: "clinicStaff_supervisorId_clinicStaff_id"
	}),
	clinicStaffs: many(clinicStaff, {
		relationName: "clinicStaff_supervisorId_clinicStaff_id"
	}),
	role: one(roles, {
		fields: [clinicStaff.roleId],
		references: [roles.id]
	}),
}));

export const rolesRelations = relations(roles, ({many}) => ({
	clinicStaffs: many(clinicStaff),
}));

export const doctorSchedulesRelations = relations(doctorSchedules, ({one}) => ({
	doctor: one(doctors, {
		fields: [doctorSchedules.doctorId],
		references: [doctors.id]
	}),
}));

export const clinicDocumentsRelations = relations(clinicDocuments, ({one}) => ({
	clinic: one(clinics, {
		fields: [clinicDocuments.clinicId],
		references: [clinics.id]
	}),
	user: one(users, {
		fields: [clinicDocuments.uploadedBy],
		references: [users.id]
	}),
}));

export const taskHistoryRelations = relations(taskHistory, ({one}) => ({
	task: one(tasks, {
		fields: [taskHistory.taskId],
		references: [tasks.id]
	}),
	user: one(users, {
		fields: [taskHistory.changedBy],
		references: [users.id]
	}),
}));