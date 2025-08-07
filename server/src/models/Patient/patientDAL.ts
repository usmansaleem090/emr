import { db } from '../../../db';
import { patients, InsertPatient, UpdatePatient, Patient } from './patientSchema';
import { users, InsertUser } from '../securitySchema';
import { eq, and, desc, ilike, gte, lte, like } from 'drizzle-orm';
import { generateMedicalRecordNumber } from '../../utils/helpers';
import bcrypt from 'bcrypt';
import { EmailSender } from '../../utils/emailSender';
import { patientVitals } from './patientVitalsSchema';
import { patientMedicalHistory } from './patientMedicalHistorySchema';
import { patientSurgicalHistory } from './patientSurgicalHistorySchema';
import { patientMedications } from './patientMedicationsSchema';
import { patientDiagnostics } from './patientDiagnosticsSchema';
import { patientInsurance } from './patientInsuranceSchema';
import { patientClinicNotes } from './patientClinicNotesSchema';

export class PatientDAL {
  // Generate EMR number with format YYYYMMXXXX
  static async generateEMRNumber(clinicId?: number, transaction?: any): Promise<string> {
    const dbInstance = transaction || db;

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    // Create YYYYMM prefix
    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;

    // Get start and end of current month for filtering
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    // Query to find all existing EMR numbers that start with current YYYYMM
    let query = dbInstance
      .select({
        emrNumber: patients.emrNumber
      })
      .from(patients)
      .where(like(patients.emrNumber, `${yearMonth}%`));

    // Add clinic filter if provided
    if (clinicId) {
      query = query.where(
        and(
          like(patients.emrNumber, `${yearMonth}%`),
          eq(patients.clinicId, clinicId)
        )
      );
    }

    const existingEMRs = await query;

    // Extract sequential numbers from existing EMR numbers for this month
    const sequentialNumbers = existingEMRs
      .filter((record: any) => record.emrNumber && record.emrNumber.startsWith(yearMonth))
      .map((record: any) => {
        const seqPart = record.emrNumber.slice(6); // Extract XXXX part
        return parseInt(seqPart, 10);
      })
      .filter((num: number) => !isNaN(num));

    // Find the next sequential number - use max + 1 with some randomness to reduce conflicts
    const baseSequential = sequentialNumbers.length === 0
      ? 1
      : Math.max(...sequentialNumbers) + 1;
    
    // Add a small random offset to reduce race condition conflicts
    const randomOffset = Math.floor(Math.random() * 10); // 0-9
    const nextSequential = baseSequential + randomOffset;

    // Format as 4-digit string
    const sequentialString = nextSequential.toString().padStart(4, '0');

    return `${yearMonth}${sequentialString}`;
  }

  // Generate EMR number with retry mechanism to handle race conditions
  static async generateEMRNumberWithRetry(clinicId?: number, transaction?: any, maxRetries: number = 5): Promise<string> {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const emrNumber = await PatientDAL.generateEMRNumber(clinicId, transaction);
        
        // Check if this EMR number already exists
        const existingPatient = await (transaction || db)
          .select({ id: patients.id })
          .from(patients)
          .where(eq(patients.emrNumber, emrNumber))
          .limit(1);

        if (existingPatient.length === 0) {
          return emrNumber;
        }

        // If we're in a transaction, we need to wait a bit and retry
        if (transaction) {
          await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1))); // Exponential backoff
        }
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed to generate EMR number:`, error);
        if (attempt === maxRetries - 1) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      }
    }
    
    throw new Error('Failed to generate unique EMR number after maximum retries');
  }

  // Generate a more robust EMR number using timestamp and random components
  static async generateRobustEMRNumber(clinicId?: number, transaction?: any): Promise<string> {
    const dbInstance = transaction || db;
    
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const day = now.getDate();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();
    const milliseconds = now.getMilliseconds();
    
    // Create YYYYMM prefix
    const yearMonth = `${year}${month.toString().padStart(2, '0')}`;
    
    // Create a unique suffix using timestamp components and random
    const timestampSuffix = `${day.toString().padStart(2, '0')}${hours.toString().padStart(2, '0')}${minutes.toString().padStart(2, '0')}${seconds.toString().padStart(2, '0')}`;
    const randomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    
    let emrNumber = `${yearMonth}${timestampSuffix}${randomSuffix}`;
    
    // Verify uniqueness with retry mechanism
    for (let attempt = 0; attempt < 3; attempt++) {
      const existingPatient = await dbInstance
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.emrNumber, emrNumber))
        .limit(1);

      if (existingPatient.length === 0) {
        return emrNumber;
      }
      
      // If conflict exists, add more randomness and try again
      const extraRandom = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const newEmrNumber = `${emrNumber}${extraRandom}`;
      
      // Check if the new number is also unique
      const existingPatient2 = await dbInstance
        .select({ id: patients.id })
        .from(patients)
        .where(eq(patients.emrNumber, newEmrNumber))
        .limit(1);

      if (existingPatient2.length === 0) {
        return newEmrNumber;
      }
      
      // If still conflict, wait a bit and try with a completely new timestamp
      await new Promise(resolve => setTimeout(resolve, 100 * (attempt + 1)));
      
      // Generate a new timestamp-based number
      const newNow = new Date();
      const newTimestampSuffix = `${newNow.getDate().toString().padStart(2, '0')}${newNow.getHours().toString().padStart(2, '0')}${newNow.getMinutes().toString().padStart(2, '0')}${newNow.getSeconds().toString().padStart(2, '0')}`;
      const newRandomSuffix = Math.floor(Math.random() * 100).toString().padStart(2, '0');
      emrNumber = `${yearMonth}${newTimestampSuffix}${newRandomSuffix}`;
    }
    
    // If all attempts fail, throw an error
    throw new Error('Failed to generate unique EMR number after multiple attempts');
  }
  // Create patient with user account
  static async createPatientWithUser(
    userData: any,
    patientData: any
  ) {
    return await db.transaction(async (tx: any) => {
      // Hash the password
      const hashedPassword = await bcrypt.hash(userData.passwordHash, 12);

      // Create user with Patient type
      const [user] = await tx.insert(users).values({
        ...userData,
        passwordHash: hashedPassword,
        userType: 'Patient'
      }).returning();

      // Generate medical record number
      const medicalRecordNumber = await generateMedicalRecordNumber();

      // Generate EMR number with robust timestamp-based approach
      let emrNumber;
      try {
        emrNumber = await PatientDAL.generateRobustEMRNumber(patientData.clinicId || undefined, tx);
        console.log(`Generated EMR number: ${emrNumber} for clinic: ${patientData.clinicId}`);
      } catch (error) {
        // Fallback to retry mechanism if robust generation fails
        console.warn('Robust EMR generation failed, falling back to retry mechanism:', error);
        emrNumber = await PatientDAL.generateEMRNumberWithRetry(patientData.clinicId || undefined, tx);
        console.log(`Generated EMR number (fallback): ${emrNumber} for clinic: ${patientData.clinicId}`);
      }

      // Create patient record with all patient information
      const [patient] = await tx.insert(patients).values({
        userId: user.id,
        clinicId: patientData.clinicId,
        medicalRecordNumber,
        emrNumber,
        status: patientData.status || 'active',

        // Patient Bio Information
        dateOfBirth: patientData.dateOfBirth,
        mobilePhone: patientData.mobilePhone,
        homePhone: patientData.homePhone,
        gender: patientData.gender,
        socialSecurityNumber: patientData.socialSecurityNumber,
        ethnicity: patientData.ethnicity,
        race: patientData.race,
        preferredLanguage: patientData.preferredLanguage || 'English',

        // Address Information
        streetAddress: patientData.streetAddress,
        city: patientData.city,
        state: patientData.state,
        zipCode: patientData.zipCode
      }).returning();

      // Send welcome email (non-blocking, outside transaction)
      try {
        await EmailSender.sendWelcomeEmail({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email,
          userType: 'Patient',
          username: user.username || undefined,
          password: userData.passwordHash, // Original password before hashing
          clinicName: undefined
        });
      } catch (error) {
        console.error('Failed to send welcome email to patient:', error);
        // Don't fail the patient creation if email fails
      }

      return { user, patient };
    });
  }

  // Get all patients with user details
  static async getAllPatientsWithUsers(clinicId?: number) {
    const query = db
      .select({
        patient: {
          id: patients.id,
          userId: patients.userId,
          clinicId: patients.clinicId,
          medicalRecordNumber: patients.medicalRecordNumber,
          emrNumber: patients.emrNumber,
          status: patients.status,

          // Patient Bio Information
          dateOfBirth: patients.dateOfBirth,
          mobilePhone: patients.mobilePhone,
          homePhone: patients.homePhone,
          gender: patients.gender,
          socialSecurityNumber: patients.socialSecurityNumber,
          ethnicity: patients.ethnicity,
          race: patients.race,
          preferredLanguage: patients.preferredLanguage,

          // Address Information
          streetAddress: patients.streetAddress,
          city: patients.city,
          state: patients.state,
          zipCode: patients.zipCode,

          createdAt: patients.createdAt,
          updatedAt: patients.updatedAt
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          userType: users.userType
        }
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .orderBy(desc(patients.createdAt));

    if (clinicId) {
      return await query.where(eq(patients.clinicId, clinicId));
    }

    return await query;
  }

  // Get patient by ID with user details
  static async getPatientByIdWithUser(id: number) {
    const result = await db
      .select({
        patient: {
          id: patients.id,
          userId: patients.userId,
          clinicId: patients.clinicId,
          medicalRecordNumber: patients.medicalRecordNumber,
          emrNumber: patients.emrNumber,
          status: patients.status,

          // Patient Bio Information
          dateOfBirth: patients.dateOfBirth,
          mobilePhone: patients.mobilePhone,
          homePhone: patients.homePhone,
          gender: patients.gender,
          socialSecurityNumber: patients.socialSecurityNumber,
          ethnicity: patients.ethnicity,
          race: patients.race,
          preferredLanguage: patients.preferredLanguage,

          // Address Information
          streetAddress: patients.streetAddress,
          city: patients.city,
          state: patients.state,
          zipCode: patients.zipCode,

          createdAt: patients.createdAt,
          updatedAt: patients.updatedAt
        },
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          userType: users.userType
        }
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id))
      .where(eq(patients.id, id));

    return result[0] || null;
  }

  // Get patient by medical record number  
  static async getPatientByMRN(medicalRecordNumber: string) {
    const result = await db.select().from(patients)
      .where(eq(patients.medicalRecordNumber, medicalRecordNumber));
    return result[0] || null;
  }

  // Get patient by user ID
  static async getPatientByUserId(userId: number) {
    const result = await db.select().from(patients)
      .where(eq(patients.userId, userId));
    return result[0] || null;
  }

  // Update patient
  static async updatePatient(id: number, data: UpdatePatient) {
    const [patient] = await db
      .update(patients)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patients.id, id))
      .returning();

    return patient;
  }

  // Update patient user details
  static async updatePatientUser(
    patientId: number,
    userData: Partial<Omit<InsertUser, 'userType'>>,
    patientData?: UpdatePatient
  ) {
    return await db.transaction(async (tx: any) => {
      // Get patient to find userId
      const [existingPatient] = await tx
        .select()
        .from(patients)
        .where(eq(patients.id, patientId));

      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      // Update user details
      if (Object.keys(userData).length > 0) {
        await tx
          .update(users)
          .set({
            ...userData,
            updatedAt: new Date()
          })
          .where(eq(users.id, existingPatient.userId));
      }

      // Update patient details if provided
      let updatedPatient = existingPatient;
      if (patientData && Object.keys(patientData).length > 0) {
        [updatedPatient] = await tx
          .update(patients)
          .set({
            ...patientData,
            updatedAt: new Date()
          })
          .where(eq(patients.id, patientId))
          .returning();
      }

      return updatedPatient;
    });
  }

  // Delete patient (and associated user)
  static async deletePatient(id: number) {
    return await db.transaction(async (tx: any) => {
      // Get patient to find userId
      const [existingPatient] = await tx
        .select()
        .from(patients)
        .where(eq(patients.id, id));

      if (!existingPatient) {
        throw new Error('Patient not found');
      }

      // Delete all related records first (in reverse order of dependencies)

      // Delete patient vitals
      await tx.delete(patientVitals).where(eq(patientVitals.patientId, id));

      // Delete patient medical history
      await tx.delete(patientMedicalHistory).where(eq(patientMedicalHistory.patientId, id));

      // Delete patient surgical history
      await tx.delete(patientSurgicalHistory).where(eq(patientSurgicalHistory.patientId, id));

      // Delete patient medications
      await tx.delete(patientMedications).where(eq(patientMedications.patientId, id));

      // Delete patient diagnostics
      await tx.delete(patientDiagnostics).where(eq(patientDiagnostics.patientId, id));

      // Delete patient insurance
      await tx.delete(patientInsurance).where(eq(patientInsurance.patientId, id));

      // Delete patient clinic notes
      await tx.delete(patientClinicNotes).where(eq(patientClinicNotes.patientId, id));

      // Delete patient record
      await tx.delete(patients).where(eq(patients.id, id));

      // Delete user account
      await tx.delete(users).where(eq(users.id, existingPatient.userId));

      return existingPatient;
    });
  }

  // Search patients by name or MRN
  static async searchPatients(searchTerm: string, clinicId?: number) {
    const baseQuery = db
      .select({
        patient: patients,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          userType: users.userType
        }
      })
      .from(patients)
      .leftJoin(users, eq(patients.userId, users.id));

    if (clinicId) {
      return await baseQuery
        .where(
          and(
            ilike(patients.medicalRecordNumber, `%${searchTerm}%`),
            eq(patients.clinicId, clinicId)
          )
        )
        .orderBy(desc(patients.createdAt));
    } else {
      return await baseQuery
        .where(ilike(patients.medicalRecordNumber, `%${searchTerm}%`))
        .orderBy(desc(patients.createdAt));
    }
  }

  // Get patients count by clinic
  static async getPatientsCountByClinic(clinicId: number) {
    const result = await db
      .select()
      .from(patients)
      .where(eq(patients.clinicId, clinicId));

    return result.length;
  }

  // Check if email already exists in users table
  static async checkEmailExists(email: string) {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result.length > 0;
  }
}