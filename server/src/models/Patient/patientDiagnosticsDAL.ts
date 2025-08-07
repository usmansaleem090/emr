import { db } from '../../../db';
import { patientDiagnostics, InsertPatientDiagnostics, UpdatePatientDiagnostics, PatientDiagnostics } from './patientDiagnosticsSchema';
import { eq, desc, and, gte, lte, like, inArray } from 'drizzle-orm';

export class PatientDiagnosticsDAL {
  // Create new diagnostic record
  static async createDiagnostic(data: InsertPatientDiagnostics): Promise<PatientDiagnostics> {
    const [diagnostic] = await db.insert(patientDiagnostics).values(data).returning();
    return diagnostic;
  }

  // Get diagnostic by ID
  static async getDiagnosticById(id: number): Promise<PatientDiagnostics | null> {
    const result = await db.select().from(patientDiagnostics)
      .where(eq(patientDiagnostics.id, id));
    return result[0] || null;
  }

  // Get all diagnostics for a patient
  static async getDiagnosticsByPatientId(patientId: number): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(eq(patientDiagnostics.patientId, patientId))
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get diagnostics by type (Lab or Imaging)
  static async getDiagnosticsByType(patientId: number, type: 'Lab' | 'Imaging'): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, type)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get lab results for a patient
  static async getLabResultsByPatientId(patientId: number): Promise<PatientDiagnostics[]> {
    return await this.getDiagnosticsByType(patientId, 'Lab');
  }

  // Get imaging results for a patient
  static async getImagingResultsByPatientId(patientId: number): Promise<PatientDiagnostics[]> {
    return await this.getDiagnosticsByType(patientId, 'Imaging');
  }

  // Get diagnostics by date range
  static async getDiagnosticsByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          gte(patientDiagnostics.date, startDate),
          lte(patientDiagnostics.date, endDate)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get diagnostics by flag (for lab results)
  static async getDiagnosticsByFlag(patientId: number, flag: 'Normal' | 'High' | 'Low' | 'Critical High' | 'Critical Low'): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.flag, flag)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get abnormal lab results (High, Low, Critical High, Critical Low)
  static async getAbnormalLabResults(patientId: number): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, 'Lab'),
          inArray(patientDiagnostics.flag, ['High', 'Low', 'Critical High', 'Critical Low'])
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Search diagnostics by test name (for labs)
  static async searchLabTestsByPatientId(patientId: number, testName: string): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, 'Lab'),
          like(patientDiagnostics.test, `%${testName}%`)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Search diagnostics by imaging type
  static async searchImagingByType(patientId: number, imagingType: string): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, 'Imaging'),
          like(patientDiagnostics.imagingType, `%${imagingType}%`)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get diagnostics by body part (for imaging)
  static async getImagingByBodyPart(patientId: number, bodyPart: string): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, 'Imaging'),
          like(patientDiagnostics.bodyPart, `%${bodyPart}%`)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get diagnostics by trend
  static async getDiagnosticsByTrend(patientId: number, trend: 'Improving' | 'Stable' | 'Worsening' | 'New'): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.trend, trend)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Update diagnostic
  static async updateDiagnostic(id: number, data: UpdatePatientDiagnostics): Promise<PatientDiagnostics | null> {
    const [updatedDiagnostic] = await db.update(patientDiagnostics)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patientDiagnostics.id, id))
      .returning();

    return updatedDiagnostic || null;
  }

  // Delete diagnostic
  static async deleteDiagnostic(id: number): Promise<boolean> {
    const result = await db.delete(patientDiagnostics)
      .where(eq(patientDiagnostics.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Get recent diagnostics (last 30 days)
  static async getRecentDiagnostics(patientId: number, days: number = 30): Promise<PatientDiagnostics[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          gte(patientDiagnostics.date, startDate)
        )
      )
      .orderBy(desc(patientDiagnostics.date));
  }

  // Get diagnostic history by test (for labs)
  static async getLabTestHistory(patientId: number, testName: string): Promise<PatientDiagnostics[]> {
    return await db.select().from(patientDiagnostics)
      .where(
        and(
          eq(patientDiagnostics.patientId, patientId),
          eq(patientDiagnostics.type, 'Lab'),
          eq(patientDiagnostics.test, testName)
        )
      )
      .orderBy(patientDiagnostics.date); // Chronological order for trend analysis
  }
} 