import { db } from '../../../db';
import { patientClinicNotes, InsertPatientClinicNotes, UpdatePatientClinicNotes, NOTE_TYPES } from './patientClinicNotesSchema';
import { eq, and, desc, asc, like, gte, lte, count } from 'drizzle-orm';

export class PatientClinicNotesDAL {
  // Create clinic note
  static async createClinicNote(data: InsertPatientClinicNotes) {
    const [note] = await db.insert(patientClinicNotes).values(data).returning();
    return note;
  }

  // Get all clinic notes for a patient
  static async getClinicNotesByPatientId(patientId: number) {
    return await db
      .select()
      .from(patientClinicNotes)
      .where(eq(patientClinicNotes.patientId, patientId))
      .orderBy(desc(patientClinicNotes.noteDate), desc(patientClinicNotes.createdAt));
  }

  // Get clinic notes by patient ID with optional filters
  static async getClinicNotesByPatientIdWithFilters(
    patientId: number, 
    filters?: {
      noteType?: typeof NOTE_TYPES[number];
      startDate?: string;
      endDate?: string;
      searchTerm?: string;
    }
  ) {
    let conditions = [eq(patientClinicNotes.patientId, patientId)];

    // Apply filters
    if (filters?.noteType) {
      conditions.push(eq(patientClinicNotes.noteType, filters.noteType));
    }

    if (filters?.startDate) {
      conditions.push(gte(patientClinicNotes.noteDate, filters.startDate));
    }

    if (filters?.endDate) {
      conditions.push(lte(patientClinicNotes.noteDate, filters.endDate));
    }

    if (filters?.searchTerm) {
      conditions.push(like(patientClinicNotes.noteTitle, `%${filters.searchTerm}%`));
    }

    return await db
      .select()
      .from(patientClinicNotes)
      .where(and(...conditions))
      .orderBy(desc(patientClinicNotes.noteDate), desc(patientClinicNotes.createdAt));
  }

  // Get latest clinic notes for a patient (most recent)
  static async getLatestClinicNotesByPatientId(patientId: number, limit: number = 5) {
    return await db
      .select()
      .from(patientClinicNotes)
      .where(eq(patientClinicNotes.patientId, patientId))
      .orderBy(desc(patientClinicNotes.noteDate), desc(patientClinicNotes.createdAt))
      .limit(limit);
  }

  // Get clinic note by ID
  static async getClinicNoteById(id: number) {
    const [note] = await db
      .select()
      .from(patientClinicNotes)
      .where(eq(patientClinicNotes.id, id));
    return note;
  }

  // Update clinic note
  static async updateClinicNote(id: number, data: UpdatePatientClinicNotes) {
    const [note] = await db
      .update(patientClinicNotes)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(patientClinicNotes.id, id))
      .returning();
    return note;
  }

  // Delete clinic note
  static async deleteClinicNote(id: number) {
    await db.delete(patientClinicNotes).where(eq(patientClinicNotes.id, id));
  }

  // Get clinic notes by type for a patient
  static async getClinicNotesByType(patientId: number, noteType: typeof NOTE_TYPES[number]) {
    return await db
      .select()
      .from(patientClinicNotes)
      .where(
        and(
          eq(patientClinicNotes.patientId, patientId),
          eq(patientClinicNotes.noteType, noteType)
        )
      )
      .orderBy(desc(patientClinicNotes.noteDate), desc(patientClinicNotes.createdAt));
  }

  // Get clinic notes count by patient
  static async getClinicNotesCountByPatientId(patientId: number) {
    const result = await db
      .select({ count: count() })
      .from(patientClinicNotes)
      .where(eq(patientClinicNotes.patientId, patientId));
    
    return result[0]?.count || 0;
  }
} 