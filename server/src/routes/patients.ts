import express from 'express';
import { PatientDAL } from '../models/Patient';
import { insertPatientSchema, updatePatientSchema, PATIENT_STATUS } from '../models/Patient/patientSchema';
import { insertPatientVitalsSchema, updatePatientVitalsSchema } from '../models/Patient/patientVitalsSchema';
import { PatientVitalsDAL } from '../models/Patient/patientVitalsDAL';
import { insertPatientMedicalHistorySchema, updatePatientMedicalHistorySchema } from '../models/Patient/patientMedicalHistorySchema';
import { PatientMedicalHistoryDAL } from '../models/Patient/patientMedicalHistoryDAL';
import { insertPatientSurgicalHistorySchema, updatePatientSurgicalHistorySchema } from '../models/Patient/patientSurgicalHistorySchema';
import { PatientSurgicalHistoryDAL } from '../models/Patient/patientSurgicalHistoryDAL';
import { insertPatientMedicationsSchema, updatePatientMedicationsSchema } from '../models/Patient/patientMedicationsSchema';
import { PatientMedicationsDAL } from '../models/Patient/patientMedicationsDAL';
import { insertPatientDiagnosticsSchema, updatePatientDiagnosticsSchema } from '../models/Patient/patientDiagnosticsSchema';
import { PatientDiagnosticsDAL } from '../models/Patient/patientDiagnosticsDAL';
import { insertPatientInsuranceSchema, updatePatientInsuranceSchema } from '../models/Patient/patientInsuranceSchema';
import { PatientInsuranceDAL } from '../models/Patient/patientInsuranceDAL';
import { insertPatientClinicNotesSchema, updatePatientClinicNotesSchema, NOTE_TYPES } from '../models/Patient/patientClinicNotesSchema';
import { PatientClinicNotesDAL } from '../models/Patient/patientClinicNotesDAL';
import { insertClinicDocumentSchema } from '../models/clinicSchema';
import { ClinicDocumentDAL } from '../dal';
import { insertUserSchema } from '../models/securitySchema';
import { createResponse } from '../utils/helpers';
import { authMiddleware as authenticateToken } from '../middleware/authMiddleware';
import { z } from 'zod';
import { PatientPriorVisitDAL } from '../models/Patient/patientPriorVisitDAL';

const router = express.Router();

// Schema for creating patient with user
const createPatientWithUserSchema = z.object({
  user: z.object({
    firstName: z.string().min(2),
    lastName: z.string().min(2),
    email: z.string().email(),
    phone: z.string().optional(),
    password: z.string().min(6)
  }),
  patient: insertPatientSchema.omit({ userId: true }),
  vitals: insertPatientVitalsSchema.omit({ patientId: true }).optional(), // Optional vitals data
  medicalHistory: insertPatientMedicalHistorySchema.omit({ patientId: true }).optional(), // Optional medical history
  surgicalHistory: z.array(insertPatientSurgicalHistorySchema.omit({ patientId: true })).optional(), // Optional surgical history (array)
  medications: z.array(insertPatientMedicationsSchema.omit({ patientId: true })).optional(), // Optional medications (array)
  diagnostics: z.array(insertPatientDiagnosticsSchema.omit({ patientId: true })).optional(), // Optional diagnostics (array)
  insurance: z.array(insertPatientInsuranceSchema.omit({ patientId: true })).optional(), // Optional insurance (array)
  clinicNotes: z.array(insertPatientClinicNotesSchema.omit({ patientId: true })).optional(), // Optional clinic notes (array)
  clinicDocuments: z.array(insertClinicDocumentSchema.omit({ clinicId: true, uploadedBy: true })).optional(), // Optional clinic documents (array)
  priorVisit: z.array(z.object({
    date: z.string(),
    reason: z.string(),
    notes: z.string().optional()
  })).optional()
});

// Get all patients
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    const { clinic_id } = req.query;
    const clinicId = clinic_id ? parseInt(clinic_id as string) : user?.clinicId;
    
    const patientsWithUsers = await PatientDAL.getAllPatientsWithUsers(clinicId);
    console.log('Raw patientsWithUsers from DAL:', JSON.stringify(patientsWithUsers, null, 2));
    
    // Transform data to match frontend expectations with all patient data
    const patients = await Promise.all(patientsWithUsers.map(async (item: any) => {
      const patientId = item.patient.id;
      
      // Fetch all related data for each patient
      const [
        vitals,
        medicalHistory,
        surgicalHistory,
        medications,
        diagnostics,
        insurance,
        clinicNotes,
        clinicDocuments
      ] = await Promise.all([
        PatientVitalsDAL.getLatestVitalsByPatientId(patientId),
        PatientMedicalHistoryDAL.getLatestMedicalHistoryByPatientId(patientId),
        PatientSurgicalHistoryDAL.getSurgicalHistoryByPatientId(patientId),
        PatientMedicationsDAL.getActiveMedicationsByPatientId(patientId),
        PatientDiagnosticsDAL.getDiagnosticsByPatientId(patientId),
        PatientInsuranceDAL.getActiveInsuranceByPatientId(patientId),
        PatientClinicNotesDAL.getLatestClinicNotesByPatientId(patientId, 5),
        ClinicDocumentDAL.getLatestDocumentsByClinicId(item.patient.clinicId, 5)
      ]);
      
      return {
        id: item.patient.id,
        firstName: item.user.firstName,
        lastName: item.user.lastName,
        email: item.user.email,
        phone: item.user.phone,
        medicalRecordNumber: item.patient.medicalRecordNumber,
        emrNumber: item.patient.emrNumber,
        userId: item.patient.userId,
        clinicId: item.patient.clinicId,
        status: item.patient.status,
        
        // Patient Bio and Address Information
        dateOfBirth: item.patient.dateOfBirth,
        mobilePhone: item.patient.mobilePhone,
        homePhone: item.patient.homePhone,
        gender: item.patient.gender,
        socialSecurityNumber: item.patient.socialSecurityNumber,
        ethnicity: item.patient.ethnicity,
        race: item.patient.race,
        preferredLanguage: item.patient.preferredLanguage,
        streetAddress: item.patient.streetAddress,
        city: item.patient.city,
        state: item.patient.state,
        zipCode: item.patient.zipCode,
        
        // Related Data
        vitals: vitals,
        medicalHistory: medicalHistory,
        surgicalHistory: surgicalHistory,
        medications: medications,
        diagnostics: diagnostics,
        insurance: insurance,
        clinicNotes: clinicNotes,
        clinicDocuments: clinicDocuments,
        
        createdAt: item.patient.createdAt,
        updatedAt: item.patient.updatedAt
      };
    }));
    
    console.log('Transformed patients for frontend:', JSON.stringify(patients, null, 2));
    
    res.json(createResponse(
      true,
      'Patients retrieved successfully',
      patients
    ));
  } catch (error: any) {
    console.error('Error fetching patients:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch patients',
      null,
      { error: error.message }
    ));
  }
});


// Get patient by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const patient = await PatientDAL.getPatientByIdWithUser(parseInt(id));
    
    if (!patient) {
      return res.status(404).json(createResponse(
        false,
        'Patient not found'
      ));
    }
    
    // Fetch all related data for the patient
    const [
      vitals,
      medicalHistory,
      surgicalHistory,
      medications,
      diagnostics,
      insurance,
      clinicNotes,
      clinicDocuments
    ] = await Promise.all([
      PatientVitalsDAL.getLatestVitalsByPatientId(parseInt(id)),
      PatientMedicalHistoryDAL.getLatestMedicalHistoryByPatientId(parseInt(id)),
      PatientSurgicalHistoryDAL.getSurgicalHistoryByPatientId(parseInt(id)),
      PatientMedicationsDAL.getActiveMedicationsByPatientId(parseInt(id)),
      PatientDiagnosticsDAL.getDiagnosticsByPatientId(parseInt(id)),
      PatientInsuranceDAL.getActiveInsuranceByPatientId(parseInt(id)),
      PatientClinicNotesDAL.getLatestClinicNotesByPatientId(parseInt(id), 10),
              patient.patient.clinicId ? ClinicDocumentDAL.getLatestDocumentsByClinicId(patient.patient.clinicId, 10) : Promise.resolve([])
    ]);
    
    // Transform data to include all patient information
    const completePatientData = {
      // Basic patient and user information
      id: patient.patient.id,
      firstName: patient.user?.firstName || '',
      lastName: patient.user?.lastName || '',
      email: patient.user?.email || '',
      phone: patient.user?.phone || '',
      medicalRecordNumber: patient.patient.medicalRecordNumber,
      emrNumber: patient.patient.emrNumber,
      userId: patient.patient.userId,
      clinicId: patient.patient.clinicId,
      status: patient.patient.status,
      
      // Patient Bio and Address Information
      dateOfBirth: patient.patient.dateOfBirth,
      mobilePhone: patient.patient.mobilePhone,
      homePhone: patient.patient.homePhone,
      gender: patient.patient.gender,
      socialSecurityNumber: patient.patient.socialSecurityNumber,
      ethnicity: patient.patient.ethnicity,
      race: patient.patient.race,
      preferredLanguage: patient.patient.preferredLanguage,
      streetAddress: patient.patient.streetAddress,
      city: patient.patient.city,
      state: patient.patient.state,
      zipCode: patient.patient.zipCode,
      
      // Related Data
      vitals: vitals,
      medicalHistory: medicalHistory,
      surgicalHistory: surgicalHistory,
      medications: medications,
      diagnostics: diagnostics,
      insurance: insurance,
      clinicNotes: clinicNotes,
      clinicDocuments: clinicDocuments,
      
      createdAt: patient.patient.createdAt,
      updatedAt: patient.patient.updatedAt
    };
    
    res.json(createResponse(
      true,
      'Patient retrieved successfully',
      completePatientData
    ));
  } catch (error: any) {
    console.error('Error fetching patient:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch patient',
      null,
      { error: error.message }
    ));
  }
});

// Create patient with user account
router.post('/', authenticateToken, async (req, res) => {
  try {
    // Transform null values to undefined before validation
    const transformNullValues = (obj: any): any => {
      if (obj === null || obj === undefined) return undefined;
      if (typeof obj === 'object' && !Array.isArray(obj)) {
        const transformed: any = {};
        for (const [key, value] of Object.entries(obj)) {
          if (value === null) {
            transformed[key] = undefined;
          } else if (typeof value === 'object' && value !== null) {
            transformed[key] = transformNullValues(value);
          } else {
            transformed[key] = value;
          }
        }
        return transformed;
      }
      return obj;
    };

    const transformedBody = transformNullValues(req.body);
    const validatedData = createPatientWithUserSchema.parse(transformedBody);
    
    // Check if email already exists
    const emailExists = await PatientDAL.checkEmailExists(validatedData.user.email);
    if (emailExists) {
      return res.status(409).json(createResponse(
        false,
        'Email already exists'
      ));
    }

    // Medical record number is auto-generated, no need to check
    
    // Transform user data for PatientDAL
    const userData = {
      firstName: validatedData.user.firstName,
      lastName: validatedData.user.lastName,
      email: validatedData.user.email,
      phone: validatedData.user.phone,
      username: validatedData.user.email, // Use email as username
      passwordHash: validatedData.user.password // Will be hashed in DAL
    };

    const result = await PatientDAL.createPatientWithUser(
      userData,
      validatedData.patient
    );
    
    // Create vitals record if provided
    let vitalsResult = null;
    if (validatedData.vitals) {
      vitalsResult = await PatientVitalsDAL.createVitals({
        ...validatedData.vitals,
        patientId: result.patient.id
      });
    }
    
    // Create medical history record if provided
    let medicalHistoryResult = null;
    if (validatedData.medicalHistory) {
      medicalHistoryResult = await PatientMedicalHistoryDAL.createMedicalHistory({
        ...validatedData.medicalHistory,
        patientId: result.patient.id
      });
    }
    
    // Create surgical history records if provided
    let surgicalHistoryResult = null;
    if (validatedData.surgicalHistory && validatedData.surgicalHistory.length > 0) {
      surgicalHistoryResult = await Promise.all(
        validatedData.surgicalHistory.map(surgery => 
          PatientSurgicalHistoryDAL.createSurgicalHistory({
            ...surgery,
            patientId: result.patient.id
          })
        )
      );
    }
    
    // Create medication records if provided
    let medicationsResult = null;
    if (validatedData.medications && validatedData.medications.length > 0) {
      medicationsResult = await Promise.all(
        validatedData.medications.map(medication => 
          PatientMedicationsDAL.createMedication({
            ...medication,
            patientId: result.patient.id
          })
        )
      );
    }
    
    // Create diagnostic records if provided
    let diagnosticsResult = null;
    if (validatedData.diagnostics && validatedData.diagnostics.length > 0) {
      diagnosticsResult = await Promise.all(
        validatedData.diagnostics.map(diagnostic => 
          PatientDiagnosticsDAL.createDiagnostic({
            ...diagnostic,
            patientId: result.patient.id
          })
        )
      );
    }
    
    // Create insurance records if provided
    let insuranceResult = null;
    if (validatedData.insurance && validatedData.insurance.length > 0) {
      insuranceResult = await Promise.all(
        validatedData.insurance.map(insurance => 
          PatientInsuranceDAL.createInsurance({
            ...insurance,
            patientId: result.patient.id
          })
        )
      );
    }
    
    // Create clinic notes records if provided
    let clinicNotesResult = null;
    if (validatedData.clinicNotes && validatedData.clinicNotes.length > 0) {
      clinicNotesResult = await Promise.all(
        validatedData.clinicNotes.map(note => 
          PatientClinicNotesDAL.createClinicNote({
            ...note,
            patientId: result.patient.id
          })
        )
      );
    }
    
    // Create clinic documents records if provided
    let clinicDocumentsResult = null;
    if (validatedData.clinicDocuments && validatedData.clinicDocuments.length > 0) {
      const user = (req as any).user;
      clinicDocumentsResult = await Promise.all(
        validatedData.clinicDocuments.map(document => 
          ClinicDocumentDAL.createDocument({
            ...document,
            clinicId: result.patient.clinicId || user.clinicId,
            uploadedBy: user.id
          })
        )
      );
    }
    
    // Create prior visit records if provided
    let priorVisitResult = null;
    if (validatedData.priorVisit && validatedData.priorVisit.length > 0) {
      priorVisitResult = await Promise.all(
        validatedData.priorVisit.map(visit =>
          PatientPriorVisitDAL.createPriorVisit({
            ...visit,
            patientId: result.patient.id
          })
        )
      );
    }
    
    res.status(201).json(createResponse(
      true,
      'Patient created successfully',
      {
        ...result,
        vitals: vitalsResult,
        medicalHistory: medicalHistoryResult,
        surgicalHistory: surgicalHistoryResult,
        medications: medicationsResult,
        diagnostics: diagnosticsResult,
        insurance: insuranceResult,
        clinicNotes: clinicNotesResult,
        clinicDocuments: clinicDocumentsResult,
        priorVisit: priorVisitResult
      }
    ));
  } catch (error: any) {
    console.error('Error creating patient:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json(createResponse(
        false,
        'Validation error',
        null,
        { errors: error.errors }
      ));
    }

    // Handle unique constraint violations
    if (error.message && error.message.includes('duplicate key value violates unique constraint')) {
      if (error.message.includes('patients_emr_number_unique')) {
        return res.status(409).json(createResponse(
          false,
          'EMR number already exists. Please try again.',
          null,
          { error: 'EMR number conflict' }
        ));
      }
      if (error.message.includes('users_email_unique')) {
        return res.status(409).json(createResponse(
          false,
          'Email address already exists',
          null,
          { error: 'Email already exists' }
        ));
      }
      return res.status(409).json(createResponse(
        false,
        'Duplicate entry found',
        null,
        { error: error.message }
      ));
    }
    
    res.status(500).json(createResponse(
      false,
      'Failed to create patient',
      null,
      { error: error.message }
    ));
  }
});

// Update patient
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { user, patient, vitals, medicalHistory, surgicalHistory, medications, diagnostics, insurance, clinicNotes, clinicDocuments } = req.body;
    
    // Validate user data if provided
    let validatedUserData = {};
    if (user && Object.keys(user).length > 0) {
      const userSchema = insertUserSchema.omit({ userType: true }).partial();
      validatedUserData = userSchema.parse(user);
    }
    
    // Validate patient data if provided
    let validatedPatientData = {};
    if (patient && Object.keys(patient).length > 0) {
      validatedPatientData = updatePatientSchema.parse(patient);
    }
    
    // Validate vitals data if provided
    let validatedVitalsData = {};
    if (vitals && Object.keys(vitals).length > 0) {
      validatedVitalsData = updatePatientVitalsSchema.parse(vitals);
    }
    
    // Validate medical history data if provided
    let validatedMedicalHistoryData = {};
    if (medicalHistory && Object.keys(medicalHistory).length > 0) {
      validatedMedicalHistoryData = updatePatientMedicalHistorySchema.parse(medicalHistory);
    }
    
    // Validate surgical history data if provided
    let validatedSurgicalHistoryData: any[] = [];
    if (surgicalHistory && Array.isArray(surgicalHistory) && surgicalHistory.length > 0) {
      validatedSurgicalHistoryData = surgicalHistory.map(surgery => 
        insertPatientSurgicalHistorySchema.omit({ patientId: true }).parse(surgery)
      );
    }
    
    // Validate medications data if provided
    let validatedMedicationsData: any[] = [];
    if (medications && Array.isArray(medications) && medications.length > 0) {
      validatedMedicationsData = medications.map(medication => 
        insertPatientMedicationsSchema.omit({ patientId: true }).parse(medication)
      );
    }
    
    // Validate diagnostics data if provided
    let validatedDiagnosticsData: any[] = [];
    if (diagnostics && Array.isArray(diagnostics) && diagnostics.length > 0) {
      validatedDiagnosticsData = diagnostics.map(diagnostic => 
        insertPatientDiagnosticsSchema.omit({ patientId: true }).parse(diagnostic)
      );
    }
    
    // Validate insurance data if provided
    let validatedInsuranceData: any[] = [];
    if (insurance && Array.isArray(insurance) && insurance.length > 0) {
      validatedInsuranceData = insurance.map(insuranceRecord => 
        insertPatientInsuranceSchema.omit({ patientId: true }).parse(insuranceRecord)
      );
    }
    
    // Validate clinic notes data if provided
    let validatedClinicNotesData: any[] = [];
    if (clinicNotes && Array.isArray(clinicNotes) && clinicNotes.length > 0) {
      validatedClinicNotesData = clinicNotes.map(note => 
        insertPatientClinicNotesSchema.omit({ patientId: true }).parse(note)
      );
    }
    
    // Validate clinic documents data if provided
    let validatedClinicDocumentsData: any[] = [];
    if (clinicDocuments && Array.isArray(clinicDocuments) && clinicDocuments.length > 0) {
      validatedClinicDocumentsData = clinicDocuments.map(document => 
        insertClinicDocumentSchema.omit({ clinicId: true, uploadedBy: true }).parse(document)
      );
    }
    
    const updatedPatient = await PatientDAL.updatePatientUser(
      parseInt(id),
      validatedUserData,
      validatedPatientData
    );
    
    // Update or create vitals record if provided
    let vitalsResult = null;
    if (Object.keys(validatedVitalsData).length > 0) {
      // Check if patient has existing vitals
      const existingVitals = await PatientVitalsDAL.getLatestVitalsByPatientId(parseInt(id));
      
      if (existingVitals) {
        // Update existing vitals
        vitalsResult = await PatientVitalsDAL.updateVitals(existingVitals.id, validatedVitalsData);
      } else {
        // Create new vitals record
        vitalsResult = await PatientVitalsDAL.createVitals({
          ...validatedVitalsData,
          patientId: parseInt(id)
        });
      }
    }
    
    // Update or create medical history record if provided
    let medicalHistoryResult = null;
    if (Object.keys(validatedMedicalHistoryData).length > 0) {
      // Check if patient has existing medical history
      const existingMedicalHistory = await PatientMedicalHistoryDAL.getLatestMedicalHistoryByPatientId(parseInt(id));
      
      if (existingMedicalHistory) {
        // Update existing medical history
        medicalHistoryResult = await PatientMedicalHistoryDAL.updateMedicalHistory(existingMedicalHistory.id, validatedMedicalHistoryData);
      } else {
        // Create new medical history record
        medicalHistoryResult = await PatientMedicalHistoryDAL.createMedicalHistory({
          ...validatedMedicalHistoryData,
          patientId: parseInt(id)
        });
      }
    }
    
    // Create new surgical history records if provided
    let surgicalHistoryResult = null;
    if (validatedSurgicalHistoryData.length > 0) {
      surgicalHistoryResult = await Promise.all(
        validatedSurgicalHistoryData.map(surgery => 
          PatientSurgicalHistoryDAL.createSurgicalHistory({
            ...surgery,
            patientId: parseInt(id)
          })
        )
      );
    }
    
    // Create new medication records if provided
    let medicationsResult = null;
    if (validatedMedicationsData.length > 0) {
      medicationsResult = await Promise.all(
        validatedMedicationsData.map(medication => 
          PatientMedicationsDAL.createMedication({
            ...medication,
            patientId: parseInt(id)
          })
        )
      );
    }
    
    // Create new diagnostic records if provided
    let diagnosticsResult = null;
    if (validatedDiagnosticsData.length > 0) {
      diagnosticsResult = await Promise.all(
        validatedDiagnosticsData.map(diagnostic => 
          PatientDiagnosticsDAL.createDiagnostic({
            ...diagnostic,
            patientId: parseInt(id)
          })
        )
      );
    }
    
    // Create new insurance records if provided
    let insuranceResult = null;
    if (validatedInsuranceData.length > 0) {
      insuranceResult = await Promise.all(
        validatedInsuranceData.map(insuranceRecord => 
          PatientInsuranceDAL.createInsurance({
            ...insuranceRecord,
            patientId: parseInt(id)
          })
        )
      );
    }
    
    // Create new clinic notes records if provided
    let clinicNotesResult = null;
    if (validatedClinicNotesData.length > 0) {
      clinicNotesResult = await Promise.all(
        validatedClinicNotesData.map(note => 
          PatientClinicNotesDAL.createClinicNote({
            ...note,
            patientId: parseInt(id)
          })
        )
      );
    }
    
    // Create new clinic documents records if provided
    let clinicDocumentsResult = null;
    if (validatedClinicDocumentsData.length > 0) {
      const user = (req as any).user;
      clinicDocumentsResult = await Promise.all(
        validatedClinicDocumentsData.map(document => 
          ClinicDocumentDAL.createDocument({
            ...document,
            clinicId: parseInt(id) || user.clinicId,
            uploadedBy: user.id
          })
        )
      );
    }
    
    res.json(createResponse(
      true,
      'Patient updated successfully',
      {
        ...updatedPatient,
        vitals: vitalsResult,
        medicalHistory: medicalHistoryResult,
        surgicalHistory: surgicalHistoryResult,
        medications: medicationsResult,
        diagnostics: diagnosticsResult,
        insurance: insuranceResult,
        clinicNotes: clinicNotesResult,
        clinicDocuments: clinicDocumentsResult
      }
    ));
  } catch (error: any) {
    console.error('Error updating patient:', error);
    
    if (error.name === 'ZodError') {
      return res.status(400).json(createResponse(
        false,
        'Validation error',
        null,
        { errors: error.errors }
      ));
    }
    
    if (error.message === 'Patient not found') {
      return res.status(404).json(createResponse(
        false,
        'Patient not found'
      ));
    }
    
    res.status(500).json(createResponse(
      false,
      'Failed to update patient',
      null,
      { error: error.message }
    ));
  }
});

// Delete patient
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await PatientDAL.deletePatient(parseInt(id));
    
    res.json(createResponse(
      true,
      'Patient deleted successfully'
    ));
  } catch (error: any) {
    console.error('Error deleting patient:', error);
    
    if (error.message === 'Patient not found') {
      return res.status(404).json(createResponse(
        false,
        'Patient not found'
      ));
    }
    
    res.status(500).json(createResponse(
      false,
      'Failed to delete patient',
      null,
      { error: error.message }
    ));
  }
});

// Search patients
router.get('/search/:term', authenticateToken, async (req, res) => {
  try {
    const { term } = req.params;
    const { clinic_id } = req.query;
    const clinicId = clinic_id ? parseInt(clinic_id as string) : undefined;
    
    const patients = await PatientDAL.searchPatients(term, clinicId);
    
    res.json(createResponse(
      true,
      'Search completed',
      patients
    ));
  } catch (error: any) {
    console.error('Error searching patients:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to search patients',
      null,
      { error: error.message }
    ));
  }
});

// Get patient status options
router.get('/meta/status-options', authenticateToken, async (req, res) => {
  try {
    res.json(createResponse(
      true,
      'Patient status options retrieved',
      PATIENT_STATUS
    ));
  } catch (error: any) {
    console.error('Error fetching status options:', error);
    res.status(500).json(createResponse(
      false,
      'Failed to fetch status options',
      null,
      { error: error.message }
    ));
  }
});

export default router;