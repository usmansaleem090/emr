import { db } from '../../../db';
import { patientInsurance, InsertPatientInsurance, UpdatePatientInsurance, PatientInsurance } from './patientInsuranceSchema';
import { eq, desc, and, gte, lte, like, inArray } from 'drizzle-orm';

export class PatientInsuranceDAL {
  // Create new insurance record
  static async createInsurance(data: InsertPatientInsurance): Promise<PatientInsurance> {
    const [insurance] = await db.insert(patientInsurance).values(data).returning();
    return insurance;
  }

  // Get insurance by ID
  static async getInsuranceById(id: number): Promise<PatientInsurance | null> {
    const result = await db.select().from(patientInsurance)
      .where(eq(patientInsurance.id, id));
    return result[0] || null;
  }

  // Get all insurance records for a patient
  static async getInsuranceByPatientId(patientId: number): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(eq(patientInsurance.patientId, patientId))
      .orderBy(patientInsurance.insuranceType, desc(patientInsurance.date));
  }

  // Get active insurance records for a patient
  static async getActiveInsuranceByPatientId(patientId: number): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          eq(patientInsurance.isActive, true)
        )
      )
      .orderBy(patientInsurance.insuranceType, desc(patientInsurance.date));
  }

  // Get insurance by type (Primary, Secondary, Tertiary)
  static async getInsuranceByType(patientId: number, insuranceType: string): Promise<PatientInsurance | null> {
    const result = await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          eq(patientInsurance.insuranceType, insuranceType),
          eq(patientInsurance.isActive, true)
        )
      )
      .orderBy(desc(patientInsurance.date))
      .limit(1);
    return result[0] || null;
  }

  // Get primary insurance for a patient
  static async getPrimaryInsurance(patientId: number): Promise<PatientInsurance | null> {
    return await this.getInsuranceByType(patientId, 'Primary');
  }

  // Get secondary insurance for a patient
  static async getSecondaryInsurance(patientId: number): Promise<PatientInsurance | null> {
    return await this.getInsuranceByType(patientId, 'Secondary');
  }

  // Get tertiary insurance for a patient
  static async getTertiaryInsurance(patientId: number): Promise<PatientInsurance | null> {
    return await this.getInsuranceByType(patientId, 'Tertiary');
  }

  // Get insurance by company name
  static async getInsuranceByCompany(patientId: number, companyName: string): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          like(patientInsurance.insuranceCompanyName, `%${companyName}%`)
        )
      )
      .orderBy(desc(patientInsurance.date));
  }

  // Get insurance by plan type (PPO, HMO, Medicare, etc.)
  static async getInsuranceByPlanType(patientId: number, planType: string): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          like(patientInsurance.insurancePlanName, `%${planType}%`)
        )
      )
      .orderBy(desc(patientInsurance.date));
  }

  // Get insurance by relationship to insured
  static async getInsuranceByRelationship(patientId: number, relationship: 'Self' | 'Spouse' | 'Child' | 'Other'): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          eq(patientInsurance.relationshipToInsured, relationship)
        )
      )
      .orderBy(desc(patientInsurance.date));
  }

  // Get insurance by date range
  static async getInsuranceByDateRange(
    patientId: number, 
    startDate: Date, 
    endDate: Date
  ): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          gte(patientInsurance.date, startDate),
          lte(patientInsurance.date, endDate)
        )
      )
      .orderBy(desc(patientInsurance.date));
  }

  // Get expiring insurance (within specified days)
  static async getExpiringInsurance(patientId: number, days: number = 30): Promise<PatientInsurance[]> {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + days);

    return await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          eq(patientInsurance.isActive, true),
          lte(patientInsurance.planExpiryDate, expiryDate.toISOString().split('T')[0])
        )
      )
      .orderBy(patientInsurance.planExpiryDate);
  }

  // Update insurance
  static async updateInsurance(id: number, data: UpdatePatientInsurance): Promise<PatientInsurance | null> {
    const [updatedInsurance] = await db.update(patientInsurance)
      .set({
        ...data,
        updatedAt: new Date()
      })
      .where(eq(patientInsurance.id, id))
      .returning();

    return updatedInsurance || null;
  }

  // Delete insurance
  static async deleteInsurance(id: number): Promise<boolean> {
    const result = await db.delete(patientInsurance)
      .where(eq(patientInsurance.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Deactivate insurance (soft delete)
  static async deactivateInsurance(id: number, notes?: string): Promise<PatientInsurance | null> {
    const [deactivatedInsurance] = await db.update(patientInsurance)
      .set({
        isActive: false,
        notes: notes ? `${patientInsurance.notes || ''}\nDeactivated: ${notes}`.trim() : patientInsurance.notes,
        updatedAt: new Date()
      })
      .where(eq(patientInsurance.id, id))
      .returning();

    return deactivatedInsurance || null;
  }

  // Activate insurance
  static async activateInsurance(id: number): Promise<PatientInsurance | null> {
    const [activatedInsurance] = await db.update(patientInsurance)
      .set({
        isActive: true,
        updatedAt: new Date()
      })
      .where(eq(patientInsurance.id, id))
      .returning();

    return activatedInsurance || null;
  }

  // Get insurance history (all records including inactive)
  static async getInsuranceHistory(patientId: number): Promise<PatientInsurance[]> {
    return await db.select().from(patientInsurance)
      .where(eq(patientInsurance.patientId, patientId))
      .orderBy(desc(patientInsurance.date));
  }

  // Check if patient has active insurance
  static async hasActiveInsurance(patientId: number): Promise<boolean> {
    const result = await db.select().from(patientInsurance)
      .where(
        and(
          eq(patientInsurance.patientId, patientId),
          eq(patientInsurance.isActive, true)
        )
      )
      .limit(1);
    return result.length > 0;
  }

  // Get insurance summary for a patient
  static async getInsuranceSummary(patientId: number): Promise<{
    primary: PatientInsurance | null;
    secondary: PatientInsurance | null;
    tertiary: PatientInsurance | null;
    hasActiveInsurance: boolean;
  }> {
    const [primary, secondary, tertiary] = await Promise.all([
      this.getPrimaryInsurance(patientId),
      this.getSecondaryInsurance(patientId),
      this.getTertiaryInsurance(patientId)
    ]);

    return {
      primary,
      secondary,
      tertiary,
      hasActiveInsurance: !!(primary || secondary || tertiary)
    };
  }
} 