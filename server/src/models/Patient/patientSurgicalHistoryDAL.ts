import { db } from '../../../db';
import { patientSurgicalHistory, InsertPatientSurgicalHistory, UpdatePatientSurgicalHistory, PatientSurgicalHistory } from './patientSurgicalHistorySchema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export class PatientSurgicalHistoryDAL {
  // Create new surgical history record
  static async createSurgicalHistory(data: InsertPatientSurgicalHistory): Promise<PatientSurgicalHistory> {
    const [surgicalHistory] = await db.insert(patientSurgicalHistory).values(data).returning();
    return surgicalHistory;
  }

  // Get surgical history by ID
  static async getSurgicalHistoryById(id: number): Promise<PatientSurgicalHistory | null> {
    const result = await db.select().from(patientSurgicalHistory)
      .where(eq(patientSurgicalHistory.id, id));
    return result[0] || null;
  }

  // Get all surgical history for a patient
  static async getSurgicalHistoryByPatientId(patientId: number): Promise<PatientSurgicalHistory[]> {
    return await db.select().from(patientSurgicalHistory)
      .where(eq(patientSurgicalHistory.patientId, patientId))
      .orderBy(desc(patientSurgicalHistory.surgeryDate));
  }

  // Get surgical history by date range
  static async getSurgicalHistoryByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientSurgicalHistory[]> {
    return await db.select().from(patientSurgicalHistory)
      .where(
        and(
          eq(patientSurgicalHistory.patientId, patientId),
          gte(patientSurgicalHistory.surgeryDate, startDate.toISOString().split('T')[0]),
          lte(patientSurgicalHistory.surgeryDate, endDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(patientSurgicalHistory.surgeryDate));
  }

  // Update surgical history
  static async updateSurgicalHistory(id: number, data: UpdatePatientSurgicalHistory): Promise<PatientSurgicalHistory | null> {
    const [updatedSurgicalHistory] = await db.update(patientSurgicalHistory)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patientSurgicalHistory.id, id))
      .returning();

    return updatedSurgicalHistory || null;
  }

  // Delete surgical history
  static async deleteSurgicalHistory(id: number): Promise<boolean> {
    const result = await db.delete(patientSurgicalHistory)
      .where(eq(patientSurgicalHistory.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get recent surgeries (last 5 years)
  static async getRecentSurgeries(patientId: number, years: number = 5): Promise<PatientSurgicalHistory[]> {
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - years);

    return await db.select().from(patientSurgicalHistory)
      .where(
        and(
          eq(patientSurgicalHistory.patientId, patientId),
          gte(patientSurgicalHistory.surgeryDate, startDate.toISOString().split('T')[0])
        )
      )
      .orderBy(desc(patientSurgicalHistory.surgeryDate));
  }
} 