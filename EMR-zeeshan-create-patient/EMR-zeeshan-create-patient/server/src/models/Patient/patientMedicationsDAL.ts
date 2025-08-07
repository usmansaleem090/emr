import { db } from '../../../db';
import { patientMedications, InsertPatientMedications, UpdatePatientMedications, PatientMedications } from './patientMedicationsSchema';
import { eq, desc, and, gte, lte, like } from 'drizzle-orm';

export class PatientMedicationsDAL {
  // Create new medication record
  static async createMedication(data: InsertPatientMedications): Promise<PatientMedications> {
    const [medication] = await db.insert(patientMedications).values(data).returning();
    return medication;
  }

  // Get medication by ID
  static async getMedicationById(id: number): Promise<PatientMedications | null> {
    const result = await db.select().from(patientMedications)
      .where(eq(patientMedications.id, id));
    return result[0] || null;
  }

  // Get all medications for a patient
  static async getMedicationsByPatientId(patientId: number): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(eq(patientMedications.patientId, patientId))
      .orderBy(desc(patientMedications.date));
  }

  // Get active medications for a patient
  static async getActiveMedicationsByPatientId(patientId: number): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(
        and(
          eq(patientMedications.patientId, patientId),
          eq(patientMedications.status, 'Active')
        )
      )
      .orderBy(desc(patientMedications.date));
  }

  // Get medications by status
  static async getMedicationsByStatus(patientId: number, status: 'Active' | 'Discontinued' | 'Completed' | 'On Hold'): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(
        and(
          eq(patientMedications.patientId, patientId),
          eq(patientMedications.status, status)
        )
      )
      .orderBy(desc(patientMedications.date));
  }

  // Get medications by date range
  static async getMedicationsByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(
        and(
          eq(patientMedications.patientId, patientId),
          gte(patientMedications.date, startDate),
          lte(patientMedications.date, endDate)
        )
      )
      .orderBy(desc(patientMedications.date));
  }

  // Search medications by name
  static async searchMedicationsByPatientId(patientId: number, medicationName: string): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(
        and(
          eq(patientMedications.patientId, patientId),
          like(patientMedications.medication, `%${medicationName}%`)
        )
      )
      .orderBy(desc(patientMedications.date));
  }

  // Update medication
  static async updateMedication(id: number, data: UpdatePatientMedications): Promise<PatientMedications | null> {
    const [updatedMedication] = await db.update(patientMedications)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patientMedications.id, id))
      .returning();

    return updatedMedication || null;
  }

  // Delete medication
  static async deleteMedication(id: number): Promise<boolean> {
    const result = await db.delete(patientMedications)
      .where(eq(patientMedications.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Discontinue medication (soft delete by changing status)
  static async discontinueMedication(id: number, notes?: string): Promise<PatientMedications | null> {
    const [discontinuedMedication] = await db.update(patientMedications)
      .set({
        status: 'Discontinued',
        notes: notes ? `${patientMedications.notes || ''}\nDiscontinued: ${notes}`.trim() : patientMedications.notes,
        updatedAt: new Date()
      })
      .where(eq(patientMedications.id, id))
      .returning();

    return discontinuedMedication || null;
  }

  // Get medication history (all medications including discontinued)
  static async getMedicationHistory(patientId: number): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(eq(patientMedications.patientId, patientId))
      .orderBy(desc(patientMedications.startDate), desc(patientMedications.date));
  }

  // Get medications by prescriber
  static async getMedicationsByPrescriber(patientId: number, prescriber: string): Promise<PatientMedications[]> {
    return await db.select().from(patientMedications)
      .where(
        and(
          eq(patientMedications.patientId, patientId),
          like(patientMedications.prescriber, `%${prescriber}%`)
        )
      )
      .orderBy(desc(patientMedications.date));
  }
} 