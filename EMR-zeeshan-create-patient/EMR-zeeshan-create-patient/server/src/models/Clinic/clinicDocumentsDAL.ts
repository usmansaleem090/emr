import { db } from '../../../db';
import { clinicDocuments, InsertClinicDocument, UpdateClinicDocument, DOCUMENT_TYPES } from '../clinicSchema';
import { eq, and, desc, asc, like, gte, lte, count } from 'drizzle-orm';

export class ClinicDocumentsDAL {
  // Create clinic document
  static async createClinicDocument(data: InsertClinicDocument) {
    const [document] = await db.insert(clinicDocuments).values(data).returning();
    return document;
  }

  // Get all clinic documents for a clinic
  static async getClinicDocumentsByClinicId(clinicId: number) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId))
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt));
  }

  // Get clinic documents by clinic ID with optional filters
  static async getClinicDocumentsByClinicIdWithFilters(
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
  static async getLatestClinicDocumentsByClinicId(clinicId: number, limit: number = 10) {
    return await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId))
      .orderBy(desc(clinicDocuments.date), desc(clinicDocuments.createdAt))
      .limit(limit);
  }

  // Get clinic document by ID
  static async getClinicDocumentById(id: number) {
    const [document] = await db
      .select()
      .from(clinicDocuments)
      .where(eq(clinicDocuments.id, id));
    return document;
  }

  // Update clinic document
  static async updateClinicDocument(id: number, data: UpdateClinicDocument) {
    const [document] = await db
      .update(clinicDocuments)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinicDocuments.id, id))
      .returning();
    return document;
  }

  // Delete clinic document
  static async deleteClinicDocument(id: number) {
    await db.delete(clinicDocuments).where(eq(clinicDocuments.id, id));
  }

  // Get clinic documents by type for a clinic
  static async getClinicDocumentsByType(clinicId: number, type: typeof DOCUMENT_TYPES[number]) {
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

  // Get clinic documents count by clinic
  static async getClinicDocumentsCountByClinicId(clinicId: number) {
    const result = await db
      .select({ count: count() })
      .from(clinicDocuments)
      .where(eq(clinicDocuments.clinicId, clinicId));
    
    return result[0]?.count || 0;
  }

  // Get clinic documents by date range
  static async getClinicDocumentsByDateRange(clinicId: number, startDate: string, endDate: string) {
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