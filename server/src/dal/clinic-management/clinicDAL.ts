import { db } from '../../../db';
import {
  clinics, clinicLocations, clinicDocuments, clinicFaxes, clinicSettings,
  type Clinic, type InsertClinic, type UpdateClinic,
  type ClinicLocation, type InsertClinicLocation,
  type ClinicDocument, type InsertClinicDocument,
  type ClinicFax, type InsertClinicFax,
  type ClinicSettings, type InsertClinicSettings, type UpdateClinicSettings,
} from '../../models/clinicSchema';
import { clinicStaff, type InsertClinicStaff, type UpdateClinicStaff } from '../../models/clinicSchema';
import { modules, users } from '../../models/securitySchema';
import { UserDAL } from '../securityDAL';
import { eq, and, desc, like, gte, lte, count } from 'drizzle-orm';

// ===== CLINIC DAL =====
export class ClinicDAL {
  static async findById(id: number): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic;
  }

  static async findByName(name: string): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.name, name));
    return clinic;
  }

  static async createClinic(clinicData: InsertClinic): Promise<Clinic> {
    const [newClinic] = await db
      .insert(clinics)
      .values(clinicData)
      .returning();
    
    return newClinic;
  }

  static async getAllClinics(): Promise<Clinic[]> {
    return db.select().from(clinics);
  }

  static async getAllClinicsWithUsers(): Promise<any[]> {
    const allClinics = await db.select().from(clinics);
    const result = [];
    
    for (const clinic of allClinics) {
      const user = await UserDAL.findByClinicId(clinic.id);
      result.push({
        ...clinic,
        user: user ? {
          id: user.id,
          username: user.username,
          email: user.email,
          status: user.status,
        } : null,
      });
    }
    
    return result;
  }

  static async getClinicById(id: number): Promise<Clinic | undefined> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    return clinic;
  }

  static async getClinicWithUserById(id: number): Promise<any> {
    const [clinic] = await db.select().from(clinics).where(eq(clinics.id, id));
    if (!clinic) return null;
    
    const user = await UserDAL.findByClinicId(clinic.id);
    return {
      ...clinic,
      user: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        status: user.status,
      } : null,
    };
  }

  static async update(id: number, clinicData: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const [updatedClinic] = await db
      .update(clinics)
      .set(clinicData)
      .where(eq(clinics.id, id))
      .returning();
    
    return updatedClinic;
  }

  static async updateClinic(id: number, clinicData: Partial<InsertClinic>): Promise<Clinic | undefined> {
    const [updatedClinic] = await db
      .update(clinics)
      .set(clinicData)
      .where(eq(clinics.id, id))
      .returning();
    
    return updatedClinic;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(clinics).where(eq(clinics.id, id));
  }

  static async deleteClinic(id: number): Promise<boolean> {
    const result = await db.delete(clinics).where(eq(clinics.id, id));
    return (result.rowCount || 0) > 0;
  }
}

// ===== CLINIC SETTINGS DAL =====
export class ClinicSettingsDAL {
  static async findByClinicId(clinicId: number): Promise<ClinicSettings | undefined> {
    const [settings] = await db
      .select()
      .from(clinicSettings)
      .where(eq(clinicSettings.clinicId, clinicId));
    return settings;
  }

  static async createSettings(settingsData: InsertClinicSettings): Promise<ClinicSettings> {
    const [newSettings] = await db
      .insert(clinicSettings)
      .values(settingsData)
      .returning();
    
    return newSettings;
  }

  static async updateSettings(clinicId: number, settingsData: UpdateClinicSettings): Promise<ClinicSettings | undefined> {
    const [updatedSettings] = await db
      .update(clinicSettings)
      .set({ ...settingsData, updatedAt: new Date() })
      .where(eq(clinicSettings.clinicId, clinicId))
      .returning();
    
    return updatedSettings;
  }

  static async deleteSettings(clinicId: number): Promise<boolean> {
    const result = await db.delete(clinicSettings).where(eq(clinicSettings.clinicId, clinicId));
    return (result.rowCount || 0) > 0;
  }

  static async getSettingsWithClinic(clinicId: number): Promise<any> {
    const [settings] = await db
      .select({
        settings: clinicSettings,
        clinic: {
          id: clinics.id,
          name: clinics.name,
          address: clinics.address,
          phone: clinics.phone,
          email: clinics.email,
          type: clinics.type,
          groupNpi: clinics.groupNpi,
          taxId: clinics.taxId,
          timeZone: clinics.timeZone,
        }
      })
      .from(clinicSettings)
      .leftJoin(clinics, eq(clinicSettings.clinicId, clinics.id))
      .where(eq(clinicSettings.clinicId, clinicId));

    return settings;
  }
}

// ===== CLINIC LOCATION DAL =====
export class ClinicLocationDAL {
  // Get all locations for a clinic
  static async getLocationsByClinicId(clinicId: number): Promise<ClinicLocation[]> {
    return await db
      .select()
      .from(clinicLocations)
      .where(eq(clinicLocations.clinicId, clinicId));
  }

  // Get location by ID
  static async getLocationById(id: number): Promise<ClinicLocation | undefined> {
    const [location] = await db
      .select()
      .from(clinicLocations)
      .where(eq(clinicLocations.id, id));
    return location;
  }

  // Create a new location
  static async createLocation(data: InsertClinicLocation): Promise<ClinicLocation> {
    const [location] = await db
      .insert(clinicLocations)
      .values(data)
      .returning();
    return location;
  }

  // Update location
  static async updateLocation(id: number, data: Partial<InsertClinicLocation>): Promise<ClinicLocation | undefined> {
    const [location] = await db
      .update(clinicLocations)
      .set(data)
      .where(eq(clinicLocations.id, id))
      .returning();
    return location;
  }

  // Delete location
  static async deleteLocation(id: number): Promise<void> {
    await db
      .delete(clinicLocations)
      .where(eq(clinicLocations.id, id));
  }

  // Get all locations (for patient booking system)
  static async getAllLocations(): Promise<ClinicLocation[]> {
    return await db
      .select()
      .from(clinicLocations);
  }
}

// ===== CLINIC DOCUMENT DAL =====
export class ClinicDocumentDAL {
  // Get all documents for a clinic
  static async getDocumentsByClinicId(clinicId: number) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId))
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt));
  }

  // Get clinic documents by clinic ID with optional filters
  static async getDocumentsByClinicIdWithFilters(
    clinicId: number, 
    filters?: {
      type?: typeof DOCUMENT_TYPES[number];
      startDate?: string;
      endDate?: string;
      searchTerm?: string;
    }
  ) {
    let conditions = [eq(clinicDocuments.clinicId, clinicId)];

    // Apply filters
    if (filters?.type) {
      conditions.push(eq(clinicDocuments.type, filters.type));
    }

    if (filters?.startDate) {
      conditions.push(gte(clinicDocuments.date, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(clinicDocuments.date, filters.endDate));
    }

    if (filters?.searchTerm) {
      conditions.push(like(clinicDocuments.title, `%${filters.searchTerm}%`));
    }

    return await db
      .select()
      .from(clinicDocuments)
      .where(and(...conditions))
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt));
  }

  // Get latest clinic documents for a clinic (most recent)
  static async getLatestDocumentsByClinicId(clinicId: number, limit: number = 10) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId))
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt))
      .limit(limit);
  }

  // Get a specific document by ID
  static async getDocumentById(id: string) {
    const result = await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.id, id))
      .limit(1);
    
    return result[0] || null;
  }

  // Get a specific document by ID and clinic ID (for authorization)
  static async getDocumentByIdAndClinicId(id: string, clinicId: number) {
    const result = await db
      .select()
      .from(clinicDocuments)
      .where(and(
        eq(clinicDocuments.id, id),
        eq(clinicDocuments.clinicId, clinicId)
      ))
      .limit(1);
    
    return result[0] || null;
  }

  // Create a new document
  static async createDocument(documentData: InsertClinicDocument) {
    const result = await db
      .insert(clinicDocuments)
      .values({
        ...documentData,
        updatedAt: new Date(),
      })
      .returning();
    
    return result[0];
  }

  // Update a document
  static async updateDocument(id: string, documentData: UpdateClinicDocument) {
    const result = await db
      .update(clinicDocuments)
      .set({
        ...documentData,
        updatedAt: new Date(),
      })
      .where(eq(clinicDocuments.id, id))
      .returning();
    
    return result[0] || null;
  }

  // Delete a document
  static async deleteDocument(id: string) {
    const result = await db
      .delete(clinicDocuments)
      .where(eq(clinicDocuments.id, id))
      .returning();
    
    return result[0] || null;
  }

  // Delete all documents for a clinic (for clinic deletion)
  static async deleteDocumentsByClinicId(clinicId: number) {
    return await db
      .delete(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId));
  }

  // Get document count for a clinic
  static async getDocumentCountByClinicId(clinicId: number) {
    const result = await db
      .select({ count: count() })
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId));
    
    return result[0]?.count || 0;
  }

  // Get clinic documents by type for a clinic
  static async getDocumentsByType(clinicId: number, type: typeof DOCUMENT_TYPES[number]) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(
        and(
          eq(clinicDocuments.clinicId, clinicId),
          eq(clinicDocuments.type, type)
        )
      )
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt));
  }

  // Get clinic documents by date range
  static async getDocumentsByDateRange(clinicId: number, startDate: string, endDate: string) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(
        and(
          eq(clinicDocuments.clinicId, clinicId),
          gte(clinicDocuments.date, startDate),
          lte(clinicDocuments.date, endDate)
        )
      )
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt));
  }
}

// ===== CLINIC FAX DAL =====
export class ClinicFaxDAL {
  static async createFax(data: InsertClinicFax) {
    const [fax] = await db.insert(clinicFaxes).values(data).returning();
    return fax;
  }

  static async getFaxesByClinicId(clinicId: number) {
    return await db.select().from(clinicFaxes)
      .where(eq(clinicFaxes.clinicId, clinicId))
      .orderBy(desc(clinicFaxes.createdAt));
  }

  static async getFaxesByClinicIdWithFilters(clinicId: number, filters?: {
    status?: typeof FAX_STATUSES[number];
    startDate?: string;
    endDate?: string;
    searchTerm?: string;
    recipient?: string;
  }) {
    let conditions = [eq(clinicFaxes.clinicId, clinicId)];

    if (filters?.status) {
      conditions.push(eq(clinicFaxes.status, filters.status));
    }

    if (filters?.startDate) {
      conditions.push(gte(clinicFaxes.createdAt, new Date(filters.startDate)));
    }

    if (filters?.endDate) {
      conditions.push(lte(clinicFaxes.createdAt, new Date(filters.endDate)));
    }

    if (filters?.searchTerm) {
      conditions.push(
        like(clinicFaxes.subject, `%${filters.searchTerm}%`)
      );
    }

    if (filters?.recipient) {
      conditions.push(
        like(clinicFaxes.recipient, `%${filters.recipient}%`)
      );
    }

    return await db.select().from(clinicFaxes)
      .where(and(...conditions))
      .orderBy(desc(clinicFaxes.createdAt));
  }

  static async getLatestFaxesByClinicId(clinicId: number, limit: number = 10) {
    return await db.select().from(clinicFaxes)
      .where(eq(clinicFaxes.clinicId, clinicId))
      .orderBy(desc(clinicFaxes.createdAt))
      .limit(limit);
  }

  static async getFaxById(id: string) {
    const [fax] = await db.select().from(clinicFaxes)
      .where(eq(clinicFaxes.id, id));
    return fax;
  }

  static async updateFax(id: string, data: UpdateClinicFax) {
    const [fax] = await db.update(clinicFaxes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinicFaxes.id, id))
      .returning();
    return fax;
  }

  static async deleteFax(id: string) {
    const [fax] = await db.delete(clinicFaxes)
      .where(eq(clinicFaxes.id, id))
      .returning();
    return fax;
  }

  static async getFaxesByStatus(clinicId: number, status: typeof FAX_STATUSES[number]) {
    return await db.select().from(clinicFaxes)
      .where(and(
        eq(clinicFaxes.clinicId, clinicId),
        eq(clinicFaxes.status, status)
      ))
      .orderBy(desc(clinicFaxes.createdAt));
  }

  static async getFaxesCountByClinicId(clinicId: number) {
    const result = await db.select({ count: count() })
      .from(clinicFaxes)
      .where(eq(clinicFaxes.clinicId, clinicId));
    return result[0]?.count || 0;
  }

  static async getFaxesByDateRange(clinicId: number, startDate: string, endDate: string) {
    return await db.select().from(clinicFaxes)
      .where(and(
        eq(clinicFaxes.clinicId, clinicId),
        gte(clinicFaxes.createdAt, new Date(startDate)),
        lte(clinicFaxes.createdAt, new Date(endDate))
      ))
      .orderBy(desc(clinicFaxes.createdAt));
  }

  static async getFaxesByRecipient(clinicId: number, recipient: string) {
    return await db.select().from(clinicFaxes)
      .where(and(
        eq(clinicFaxes.clinicId, clinicId),
        like(clinicFaxes.recipient, `%${recipient}%`)
      ))
      .orderBy(desc(clinicFaxes.createdAt));
  }

  static async updateFaxStatus(id: string, status: typeof FAX_STATUSES[number]) {
    const updateData: any = { status, updatedAt: new Date() };
    
    if (status === 'sent') {
      updateData.sentAt = new Date();
    } else if (status === 'delivered') {
      updateData.deliveredAt = new Date();
    }

    const [fax] = await db.update(clinicFaxes)
      .set(updateData)
      .where(eq(clinicFaxes.id, id))
      .returning();
    return fax;
  }
}

// ===== CLINIC MODULE DAL =====
export class ClinicModuleDAL {
  // Get all modules assigned to a clinic
  static async getClinicModules(clinicId: number) {
    return await db
      .select({
        id: clinicModules.id,
        clinicId: clinicModules.clinicId,
        moduleId: clinicModules.moduleId,
        moduleName: modules.name,
        moduleDescription: modules.description,
        createdAt: clinicModules.createdAt,
      })
      .from(clinicModules)
      .leftJoin(modules, eq(clinicModules.moduleId, modules.id))
      .where(eq(clinicModules.clinicId, clinicId));
  }

  // Assign a module to a clinic
  static async assignModuleToClinic(data: InsertClinicModule): Promise<ClinicModule> {
    const [clinicModule] = await db
      .insert(clinicModules)
      .values(data)
      .returning();
    return clinicModule;
  }

  // Remove a module from a clinic
  static async removeModuleFromClinic(clinicId: number, moduleId: number): Promise<void> {
    await db
      .delete(clinicModules)
      .where(
        and(
          eq(clinicModules.clinicId, clinicId),
          eq(clinicModules.moduleId, moduleId)
        )
      );
  }

  // Check if a clinic has a specific module
  static async hasModule(clinicId: number, moduleId: number): Promise<boolean> {
    const [result] = await db
      .select()
      .from(clinicModules)
      .where(
        and(
          eq(clinicModules.clinicId, clinicId),
          eq(clinicModules.moduleId, moduleId)
        )
      );
    return !!result;
  }

  // Replace all modules for a clinic
  static async replaceClinicModules(clinicId: number, moduleIds: number[]): Promise<void> {
    // Delete existing assignments
    await db.delete(clinicModules).where(eq(clinicModules.clinicId, clinicId));
    
    // Insert new assignments
    if (moduleIds.length > 0) {
      const assignments = moduleIds.map(moduleId => ({
        clinicId,
        moduleId,
      }));
      await db.insert(clinicModules).values(assignments);
    }
  }
}

// ===== CLINIC SERVICE DAL =====
export class ClinicServiceDAL {
  // Get all services for a clinic
  static async getByClinicId(clinicId: number): Promise<ClinicService[]> {
    return await db
      .select()
      .from(clinicServices)
      .where(eq(clinicServices.clinicId, clinicId));
  }

  // Create multiple services for a clinic
  static async createMultiple(services: InsertClinicService[]): Promise<ClinicService[]> {
    if (services.length === 0) return [];
    
    const result = await db
      .insert(clinicServices)
      .values(services)
      .returning();
    
    return result;
  }

  // Update services for a clinic (replace all)
  static async updateClinicServices(clinicId: number, newServices: InsertClinicService[]): Promise<ClinicService[]> {
    // Delete existing services
    await db
      .delete(clinicServices)
      .where(eq(clinicServices.clinicId, clinicId));

    // Insert new services
    if (newServices.length === 0) return [];
    
    const result = await db
      .insert(clinicServices)
      .values(newServices)
      .returning();
    
    return result;
  }

  // Delete all services for a clinic
  static async deleteByClinicId(clinicId: number): Promise<void> {
    await db
      .delete(clinicServices)
      .where(eq(clinicServices.clinicId, clinicId));
  }

  // Delete specific service
  static async deleteById(id: string): Promise<void> {
    await db
      .delete(clinicServices)
      .where(eq(clinicServices.id, id));
  }

  // Get service categories with counts
  static async getServiceSummary(clinicId: number): Promise<{ category: string; count: number }[]> {
    const services = await this.getByClinicId(clinicId);
    const categoryCounts = services.reduce((acc, service) => {
      acc[service.serviceCategory] = (acc[service.serviceCategory] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      category,
      count,
    }));
  }
}

// ===== CLINIC STAFF DAL =====
export class ClinicStaffDAL {
  // Get all staff members with user information
  static async getAllStaffWithUsers(clinicId?: number, locationId?: number) {
    const baseQuery = db
      .select({
        staff: clinicStaff,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          status: users.status,
          userType: users.userType,
        },
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },
        location: {
          id: clinicLocations.id,
          name: clinicLocations.name,
          address: clinicLocations.address,
        }
      })
      .from(clinicStaff)
      .leftJoin(users, eq(clinicStaff.userId, users.id))
      .leftJoin(clinics, eq(clinicStaff.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(clinicStaff.locationId, clinicLocations.id));

    let whereConditions = [];
    
    if (clinicId) {
      whereConditions.push(eq(clinicStaff.clinicId, clinicId));
    }
    
    if (locationId) {
      whereConditions.push(eq(clinicStaff.locationId, locationId));
    }

    if (whereConditions.length > 0) {
      return await baseQuery
        .where(and(...whereConditions))
        .orderBy(desc(clinicStaff.createdAt));
    }

    return await baseQuery.orderBy(desc(clinicStaff.createdAt));
  }

  // Get staff member by ID with user information
  static async getStaffByIdWithUser(id: number) {
    const result = await db
      .select({
        staff: clinicStaff,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          status: users.status,
          userType: users.userType,
        },
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },
        location: {
          id: clinicLocations.id,
          name: clinicLocations.name,
          address: clinicLocations.address,
        }
      })
      .from(clinicStaff)
      .leftJoin(users, eq(clinicStaff.userId, users.id))
      .leftJoin(clinics, eq(clinicStaff.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(clinicStaff.locationId, clinicLocations.id))
      .where(eq(clinicStaff.id, id))
      .limit(1);

    return result[0] || null;
  }

  // Get staff member by user ID
  static async getStaffByUserId(userId: number) {
    const result = await db
      .select()
      .from(clinicStaff)
      .where(eq(clinicStaff.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  // Create staff member
  static async createStaff(data: InsertClinicStaff) {
    const result = await db
      .insert(clinicStaff)
      .values(data)
      .returning();

    return result[0];
  }

  // Update staff member
  static async updateStaff(id: number, data: UpdateClinicStaff) {
    const result = await db
      .update(clinicStaff)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(clinicStaff.id, id))
      .returning();

    return result[0];
  }

  // Delete staff member
  static async deleteStaff(id: number) {
    const result = await db
      .delete(clinicStaff)
      .where(eq(clinicStaff.id, id))
      .returning();

    return result[0];
  }

  // Get staff by clinic and location
  static async getStaffByClinicAndLocation(clinicId: number, locationId: number) {
    return await db
      .select({
        staff: clinicStaff,
        user: {
          id: users.id,
          firstName: users.firstName,
          lastName: users.lastName,
          email: users.email,
          phone: users.phone,
          status: users.status,
          userType: users.userType,
        },
        clinic: {
          id: clinics.id,
          name: clinics.name,
        },
        location: {
          id: clinicLocations.id,
          name: clinicLocations.name,
          address: clinicLocations.address,
        }
      })
      .from(clinicStaff)
      .leftJoin(users, eq(clinicStaff.userId, users.id))
      .leftJoin(clinics, eq(clinicStaff.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(clinicStaff.locationId, clinicLocations.id))
      .where(
        and(
          eq(clinicStaff.clinicId, clinicId),
          eq(clinicStaff.locationId, locationId)
        )
      )
      .orderBy(desc(clinicStaff.createdAt));
  }

  // Get staff statistics for a clinic
  static async getStaffStats(clinicId: number) {
    const allStaff = await db
      .select()
      .from(clinicStaff)
      .where(eq(clinicStaff.clinicId, clinicId));

    return {
      total: allStaff.length,
      active: allStaff.filter((s: any) => s.status === 'active').length,
      inactive: allStaff.filter((s: any) => s.status === 'inactive').length,
      byDepartment: allStaff.reduce((acc: any, staff: any) => {
        acc[staff.department] = (acc[staff.department] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
    };
  }

  // Get potential supervisors (staff members who can supervise others)
  static async getPotentialSupervisors(clinicId: number, excludeId?: number) {
    const query = db
      .select({
        id: clinicStaff.id,
        firstName: users.firstName,
        lastName: users.lastName,
        department: clinicStaff.department,
      })
      .from(clinicStaff)
      .leftJoin(users, eq(clinicStaff.userId, users.id))
      .where(
        and(
          eq(clinicStaff.clinicId, clinicId),
          eq(clinicStaff.status, 'active')
        )
      )
      .orderBy(users.firstName, users.lastName);

    if (excludeId) {
      query.where(and(...query.config.where, eq(clinicStaff.id, excludeId)));
    }

    return await query;
  }
} 