import { db } from '../../../db';
import { patientMedicalHistory, InsertPatientMedicalHistory, UpdatePatientMedicalHistory, PatientMedicalHistory } from './patientMedicalHistorySchema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export class PatientMedicalHistoryDAL {
  // Create new medical history record
  static async createMedicalHistory(data: InsertPatientMedicalHistory): Promise<PatientMedicalHistory> {
    const [medicalHistory] = await db.insert(patientMedicalHistory).values(data).returning();
    return medicalHistory;
  }

  // Get medical history by ID
  static async getMedicalHistoryById(id: number): Promise<PatientMedicalHistory | null> {
    const result = await db.select().from(patientMedicalHistory)
      .where(eq(patientMedicalHistory.id, id));
    return result[0] || null;
  }

  // Get all medical history for a patient
  static async getMedicalHistoryByPatientId(patientId: number): Promise<PatientMedicalHistory[]> {
    return await db.select().from(patientMedicalHistory)
      .where(eq(patientMedicalHistory.patientId, patientId))
      .orderBy(desc(patientMedicalHistory.date));
  }

  // Get latest medical history for a patient
  static async getLatestMedicalHistoryByPatientId(patientId: number): Promise<PatientMedicalHistory | null> {
    const result = await db.select().from(patientMedicalHistory)
      .where(eq(patientMedicalHistory.patientId, patientId))
      .orderBy(desc(patientMedicalHistory.date))
      .limit(1);
    return result[0] || null;
  }

  // Get medical history by date range
  static async getMedicalHistoryByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientMedicalHistory[]> {
    return await db.select().from(patientMedicalHistory)
      .where(
        and(
          eq(patientMedicalHistory.patientId, patientId),
          gte(patientMedicalHistory.date, startDate),
          lte(patientMedicalHistory.date, endDate)
        )
      )
      .orderBy(desc(patientMedicalHistory.date));
  }

  // Update medical history
  static async updateMedicalHistory(id: number, data: UpdatePatientMedicalHistory): Promise<PatientMedicalHistory | null> {
    const [updatedMedicalHistory] = await db.update(patientMedicalHistory)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patientMedicalHistory.id, id))
      .returning();

    return updatedMedicalHistory || null;
  }

  // Delete medical history
  static async deleteMedicalHistory(id: number): Promise<boolean> {
    const result = await db.delete(patientMedicalHistory)
      .where(eq(patientMedicalHistory.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get active medical conditions for a patient (latest record)
  static async getActiveMedicalConditions(patientId: number): Promise<PatientMedicalHistory | null> {
    return await this.getLatestMedicalHistoryByPatientId(patientId);
  }
} 