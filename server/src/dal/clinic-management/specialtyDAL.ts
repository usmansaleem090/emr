import { db } from "../../../db";
import { 
  medicalSpecialties, 
  clinicSpecialties, 
  clinics,
  type MedicalSpecialty,
  type ClinicSpecialty,
  type InsertMedicalSpecialty,
  type InsertClinicSpecialty,
  type UpdateMedicalSpecialty,
  type UpdateClinicSpecialty
} from "../../models/clinicSchema";
import { eq, and, inArray, desc, asc } from "drizzle-orm";

export class SpecialtyDAL {
  // ===== MEDICAL SPECIALTIES OPERATIONS =====

  // Get all medical specialties
  static async getAllMedicalSpecialties(): Promise<MedicalSpecialty[]> {
    try {
      const result = await db
        .select()
        .from(medicalSpecialties)
        .where(eq(medicalSpecialties.isActive, true))
        .orderBy(asc(medicalSpecialties.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching medical specialties:', error);
      throw error;
    }
  }

  // Get medical specialty by ID
  static async getMedicalSpecialtyById(id: number): Promise<MedicalSpecialty | null> {
    try {
      const result = await db
        .select()
        .from(medicalSpecialties)
        .where(eq(medicalSpecialties.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching medical specialty by ID:', error);
      throw error;
    }
  }

  // Get medical specialty by name
  static async getMedicalSpecialtyByName(name: string): Promise<MedicalSpecialty | null> {
    try {
      const result = await db
        .select()
        .from(medicalSpecialties)
        .where(eq(medicalSpecialties.name, name))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching medical specialty by name:', error);
      throw error;
    }
  }

  // Create new medical specialty
  static async createMedicalSpecialty(data: InsertMedicalSpecialty): Promise<MedicalSpecialty> {
    try {
      const result = await db
        .insert(medicalSpecialties)
        .values(data)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error creating medical specialty:', error);
      throw error;
    }
  }

  // Update medical specialty
  static async updateMedicalSpecialty(id: number, data: UpdateMedicalSpecialty): Promise<MedicalSpecialty | null> {
    try {
      const result = await db
        .update(medicalSpecialties)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(medicalSpecialties.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating medical specialty:', error);
      throw error;
    }
  }

  // Delete medical specialty (soft delete by setting isActive to false)
  static async deleteMedicalSpecialty(id: number): Promise<boolean> {
    try {
      const result = await db
        .update(medicalSpecialties)
        .set({ isActive: false, updatedAt: new Date() })
        .where(eq(medicalSpecialties.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error deleting medical specialty:', error);
      throw error;
    }
  }

  // ===== CLINIC SPECIALTIES OPERATIONS =====

  // Get all specialties for a clinic
  static async getClinicSpecialties(clinicId: number): Promise<ClinicSpecialty[]> {
    try {
      const result = await db
        .select()
        .from(clinicSpecialties)
        .where(eq(clinicSpecialties.clinicId, clinicId))
        .orderBy(desc(clinicSpecialties.isPrimary), asc(clinicSpecialties.createdAt));
      
      return result;
    } catch (error) {
      console.error('Error fetching clinic specialties:', error);
      throw error;
    }
  }

  // Get clinic specialties with specialty details
  static async getClinicSpecialtiesWithDetails(clinicId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          id: clinicSpecialties.id,
          clinicId: clinicSpecialties.clinicId,
          specialtyId: clinicSpecialties.specialtyId,
          isPrimary: clinicSpecialties.isPrimary,
          notes: clinicSpecialties.notes,
          createdAt: clinicSpecialties.createdAt,
          updatedAt: clinicSpecialties.updatedAt,
          specialty: {
            id: medicalSpecialties.id,
            name: medicalSpecialties.name,
            description: medicalSpecialties.description,
            isActive: medicalSpecialties.isActive
          }
        })
        .from(clinicSpecialties)
        .innerJoin(medicalSpecialties, eq(clinicSpecialties.specialtyId, medicalSpecialties.id))
        .where(and(
          eq(clinicSpecialties.clinicId, clinicId),
          eq(medicalSpecialties.isActive, true)
        ))
        .orderBy(desc(clinicSpecialties.isPrimary), asc(medicalSpecialties.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching clinic specialties with details:', error);
      throw error;
    }
  }

  // Get clinic specialty by ID
  static async getClinicSpecialtyById(id: number): Promise<ClinicSpecialty | null> {
    try {
      const result = await db
        .select()
        .from(clinicSpecialties)
        .where(eq(clinicSpecialties.id, id))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching clinic specialty by ID:', error);
      throw error;
    }
  }

  // Check if clinic has a specific specialty
  static async clinicHasSpecialty(clinicId: number, specialtyId: number): Promise<boolean> {
    try {
      const result = await db
        .select()
        .from(clinicSpecialties)
        .where(and(
          eq(clinicSpecialties.clinicId, clinicId),
          eq(clinicSpecialties.specialtyId, specialtyId)
        ))
        .limit(1);
      
      return result.length > 0;
    } catch (error) {
      console.error('Error checking if clinic has specialty:', error);
      throw error;
    }
  }

  // Add specialty to clinic
  static async addSpecialtyToClinic(data: InsertClinicSpecialty): Promise<ClinicSpecialty> {
    try {
      const result = await db
        .insert(clinicSpecialties)
        .values(data)
        .returning();
      
      return result[0];
    } catch (error) {
      console.error('Error adding specialty to clinic:', error);
      throw error;
    }
  }

  // Update clinic specialty
  static async updateClinicSpecialty(id: number, data: UpdateClinicSpecialty): Promise<ClinicSpecialty | null> {
    try {
      const result = await db
        .update(clinicSpecialties)
        .set({ ...data, updatedAt: new Date() })
        .where(eq(clinicSpecialties.id, id))
        .returning();
      
      return result[0] || null;
    } catch (error) {
      console.error('Error updating clinic specialty:', error);
      throw error;
    }
  }

  // Remove specialty from clinic
  static async removeSpecialtyFromClinic(clinicId: number, specialtyId: number): Promise<boolean> {
    try {
      const result = await db
        .delete(clinicSpecialties)
        .where(and(
          eq(clinicSpecialties.clinicId, clinicId),
          eq(clinicSpecialties.specialtyId, specialtyId)
        ))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error removing specialty from clinic:', error);
      throw error;
    }
  }

  // Remove clinic specialty by ID
  static async removeClinicSpecialtyById(id: number): Promise<boolean> {
    try {
      const result = await db
        .delete(clinicSpecialties)
        .where(eq(clinicSpecialties.id, id))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error removing clinic specialty by ID:', error);
      throw error;
    }
  }

  // Set primary specialty for clinic
  static async setPrimarySpecialty(clinicId: number, specialtyId: number): Promise<boolean> {
    try {
      // First, remove primary flag from all specialties for this clinic
      await db
        .update(clinicSpecialties)
        .set({ isPrimary: false, updatedAt: new Date() })
        .where(eq(clinicSpecialties.clinicId, clinicId));

      // Then set the specified specialty as primary
      const result = await db
        .update(clinicSpecialties)
        .set({ isPrimary: true, updatedAt: new Date() })
        .where(and(
          eq(clinicSpecialties.clinicId, clinicId),
          eq(clinicSpecialties.specialtyId, specialtyId)
        ))
        .returning();
      
      return result.length > 0;
    } catch (error) {
      console.error('Error setting primary specialty:', error);
      throw error;
    }
  }

  // Get primary specialty for clinic
  static async getPrimarySpecialty(clinicId: number): Promise<ClinicSpecialty | null> {
    try {
      const result = await db
        .select()
        .from(clinicSpecialties)
        .where(and(
          eq(clinicSpecialties.clinicId, clinicId),
          eq(clinicSpecialties.isPrimary, true)
        ))
        .limit(1);
      
      return result[0] || null;
    } catch (error) {
      console.error('Error fetching primary specialty:', error);
      throw error;
    }
  }

  // Bulk operations for clinic specialties
  static async bulkUpdateClinicSpecialties(clinicId: number, specialtyIds: number[]): Promise<boolean> {
    try {
      // Remove all existing specialties for this clinic
      await db
        .delete(clinicSpecialties)
        .where(eq(clinicSpecialties.clinicId, clinicId));

      // Add new specialties
      if (specialtyIds.length > 0) {
        const clinicSpecialtyData = specialtyIds.map((specialtyId, index) => ({
          clinicId,
          specialtyId,
          isPrimary: index === 0, // First specialty becomes primary
          notes: null
        }));

        await db
          .insert(clinicSpecialties)
          .values(clinicSpecialtyData);
      }

      return true;
    } catch (error) {
      console.error('Error bulk updating clinic specialties:', error);
      throw error;
    }
  }

  // Get clinics by specialty
  static async getClinicsBySpecialty(specialtyId: number): Promise<any[]> {
    try {
      const result = await db
        .select({
          clinicId: clinicSpecialties.clinicId,
          isPrimary: clinicSpecialties.isPrimary,
          notes: clinicSpecialties.notes,
          clinic: {
            id: clinics.id,
            name: clinics.name,
            address: clinics.address,
            phone: clinics.phone,
            email: clinics.email
          }
        })
        .from(clinicSpecialties)
        .innerJoin(clinics, eq(clinicSpecialties.clinicId, clinics.id))
        .where(eq(clinicSpecialties.specialtyId, specialtyId))
        .orderBy(desc(clinicSpecialties.isPrimary), asc(clinics.name));
      
      return result;
    } catch (error) {
      console.error('Error fetching clinics by specialty:', error);
      throw error;
    }
  }

  // Seed default medical specialties
  static async seedDefaultSpecialties(): Promise<void> {
    try {
      const defaultSpecialties = [
        { name: 'Internal Medicine', description: 'General internal medicine for adults' },
        { name: 'Family Medicine', description: 'Comprehensive care for all ages' },
        { name: 'Cardiology', description: 'Heart and cardiovascular system' },
        { name: 'Neurology', description: 'Nervous system and brain disorders' },
        { name: 'Pediatrics', description: 'Medical care for infants, children, and adolescents' },
        { name: 'Orthopedics', description: 'Bones, joints, and musculoskeletal system' },
        { name: 'Dermatology', description: 'Skin, hair, and nail conditions' },
        { name: 'Psychiatry', description: 'Mental health and behavioral disorders' },
        { name: 'Radiology', description: 'Medical imaging and diagnostic procedures' },
        { name: 'Emergency Medicine', description: 'Acute care and emergency treatment' },
        { name: 'Anesthesiology', description: 'Pain management and surgical anesthesia' },
        { name: 'Pathology', description: 'Disease diagnosis through laboratory analysis' },
        { name: 'Oncology', description: 'Cancer diagnosis and treatment' },
        { name: 'Endocrinology', description: 'Hormone and metabolic disorders' },
        { name: 'Gastroenterology', description: 'Digestive system and gastrointestinal disorders' },
        { name: 'Pulmonology', description: 'Respiratory system and lung disorders' },
        { name: 'Nephrology', description: 'Kidney diseases and renal system' },
        { name: 'Rheumatology', description: 'Autoimmune and inflammatory diseases' },
        { name: 'Infectious Disease', description: 'Bacterial, viral, and parasitic infections' },
        { name: 'General Surgery', description: 'Surgical procedures and operations' }
      ];

      for (const specialty of defaultSpecialties) {
        const existing = await this.getMedicalSpecialtyByName(specialty.name);
        if (!existing) {
          await this.createMedicalSpecialty(specialty);
        }
      }
    } catch (error) {
      console.error('Error seeding default specialties:', error);
      throw error;
    }
  }
} 