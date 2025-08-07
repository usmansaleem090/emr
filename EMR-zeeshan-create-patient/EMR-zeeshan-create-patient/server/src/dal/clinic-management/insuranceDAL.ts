import { db } from '../../../db';
import { insuranceProviders, clinicInsurances } from '../../models/clinicSchema';
import { eq, and } from 'drizzle-orm';
import type { 
  InsuranceProvider, 
  InsertInsuranceProvider, 
  UpdateInsuranceProvider,
  ClinicInsurance,
  InsertClinicInsurance,
  UpdateClinicInsurance
} from '../../models/clinicSchema';

export class InsuranceDAL {
  // ===== INSURANCE PROVIDERS DAL =====

  // Get all active insurance providers
  static async getAllInsuranceProviders(): Promise<InsuranceProvider[]> {
    return await db
      .select()
      .from(insuranceProviders)
      .where(eq(insuranceProviders.isActive, true))
      .orderBy(insuranceProviders.name);
  }

  // Get insurance provider by ID
  static async getInsuranceProviderById(id: number): Promise<InsuranceProvider | undefined> {
    const result = await db
      .select()
      .from(insuranceProviders)
      .where(eq(insuranceProviders.id, id));
    
    return result[0];
  }

  // Get insurance provider by name
  static async getInsuranceProviderByName(name: string): Promise<InsuranceProvider | undefined> {
    const result = await db
      .select()
      .from(insuranceProviders)
      .where(eq(insuranceProviders.name, name));
    
    return result[0];
  }

  // Create new insurance provider
  static async createInsuranceProvider(providerData: InsertInsuranceProvider): Promise<InsuranceProvider> {
    const result = await db
      .insert(insuranceProviders)
      .values(providerData)
      .returning();
    
    return result[0];
  }

  // Update insurance provider
  static async updateInsuranceProvider(id: number, providerData: UpdateInsuranceProvider): Promise<InsuranceProvider | undefined> {
    const result = await db
      .update(insuranceProviders)
      .set(providerData)
      .where(eq(insuranceProviders.id, id))
      .returning();
    
    return result[0];
  }

  // Delete insurance provider
  static async deleteInsuranceProvider(id: number): Promise<boolean> {
    const result = await db
      .delete(insuranceProviders)
      .where(eq(insuranceProviders.id, id));
    
    return result.rowCount > 0;
  }

  // ===== CLINIC INSURANCES DAL =====

  // Get all insurances for a clinic with provider details
  static async getClinicInsurancesWithDetails(clinicId: number): Promise<any[]> {
    return await db
      .select({
        id: clinicInsurances.id,
        clinicId: clinicInsurances.clinicId,
        insuranceId: clinicInsurances.insuranceId,
        isPrimary: clinicInsurances.isPrimary,
        notes: clinicInsurances.notes,
        createdAt: clinicInsurances.createdAt,
        updatedAt: clinicInsurances.updatedAt,
        insurance: {
          id: insuranceProviders.id,
          name: insuranceProviders.name,
          description: insuranceProviders.description,
          isActive: insuranceProviders.isActive,
        }
      })
      .from(clinicInsurances)
      .leftJoin(insuranceProviders, eq(clinicInsurances.insuranceId, insuranceProviders.id))
      .where(eq(clinicInsurances.clinicId, clinicId))
      .orderBy(clinicInsurances.isPrimary, clinicInsurances.createdAt);
  }

  // Get clinic insurance by ID
  static async getClinicInsuranceById(id: number): Promise<ClinicInsurance | undefined> {
    const result = await db
      .select()
      .from(clinicInsurances)
      .where(eq(clinicInsurances.id, id));
    
    return result[0];
  }

  // Create new clinic insurance
  static async createClinicInsurance(insuranceData: InsertClinicInsurance): Promise<ClinicInsurance> {
    const result = await db
      .insert(clinicInsurances)
      .values(insuranceData)
      .returning();
    
    return result[0];
  }

  // Update clinic insurance
  static async updateClinicInsurance(id: number, insuranceData: UpdateClinicInsurance): Promise<ClinicInsurance | undefined> {
    const result = await db
      .update(clinicInsurances)
      .set(insuranceData)
      .where(eq(clinicInsurances.id, id))
      .returning();
    
    return result[0];
  }

  // Delete clinic insurance
  static async deleteClinicInsurance(id: number): Promise<boolean> {
    const result = await db
      .delete(clinicInsurances)
      .where(eq(clinicInsurances.id, id));
    
    return result.rowCount > 0;
  }

  // Bulk update clinic insurances (delete all existing and insert new ones)
  static async bulkUpdateClinicInsurances(clinicId: number, insuranceIds: number[]): Promise<void> {
    // Delete all existing insurances for this clinic
    await db
      .delete(clinicInsurances)
      .where(eq(clinicInsurances.clinicId, clinicId));

    // Insert new insurances
    if (insuranceIds.length > 0) {
      const insuranceData = insuranceIds.map((insuranceId, index) => ({
        clinicId,
        insuranceId,
        isPrimary: index === 0, // First insurance is primary
        notes: null
      }));

      await db
        .insert(clinicInsurances)
        .values(insuranceData);
    }
  }

  // Seed default insurance providers
  static async seedDefaultInsuranceProviders(): Promise<void> {
    try {
      const defaultProviders = [
        { name: 'Blue Cross Blue Shield', description: 'Blue Cross Blue Shield Association' },
        { name: 'Aetna', description: 'Aetna Inc.' },
        { name: 'Medicaid', description: 'State Medicaid programs' },
        { name: 'Medicare', description: 'Federal Medicare program' },
        { name: 'Tricare', description: 'Military health care program' },
        { name: 'Cigna', description: 'Cigna Corporation' },
        { name: 'United Healthcare', description: 'UnitedHealth Group' },
        { name: 'Humana', description: 'Humana Inc.' },
        { name: 'Kaiser Permanente', description: 'Kaiser Permanente' },
        { name: 'Anthem', description: 'Anthem Inc.' },
        { name: 'Molina Healthcare', description: 'Molina Healthcare Inc.' },
        { name: 'WellCare', description: 'WellCare Health Plans' },
        { name: 'Centene', description: 'Centene Corporation' },
        { name: 'Independence Blue Cross', description: 'Independence Blue Cross' },
        { name: 'HealthFirst', description: 'HealthFirst' },
        { name: 'Oscar Health', description: 'Oscar Health Inc.' },
        { name: 'Bright Health', description: 'Bright Health Group' },
        { name: 'Friday Health Plans', description: 'Friday Health Plans' }
      ];

      for (const provider of defaultProviders) {
        const existing = await this.getInsuranceProviderByName(provider.name);
        if (!existing) {
          await this.createInsuranceProvider(provider);
        }
      }
    } catch (error) {
      console.error('Error seeding default insurance providers:', error);
      throw error;
    }
  }
} 