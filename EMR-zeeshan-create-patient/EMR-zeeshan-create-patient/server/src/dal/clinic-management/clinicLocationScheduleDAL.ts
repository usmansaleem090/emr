import { db } from '../../../db';
import { clinicLocationSchedules, clinicLocations } from '../../models/clinicSchema';
import { eq, and, gte, lte, isNull, desc, or } from 'drizzle-orm';
import type { InsertClinicLocationSchedule, UpdateClinicLocationSchedule } from '../../models/clinicSchema';

export class ClinicLocationScheduleDAL {
  // Create a new schedule for a location
  static async createSchedule(data: InsertClinicLocationSchedule) {
    const [schedule] = await db.insert(clinicLocationSchedules).values(data).returning();
    return schedule;
  }

  // Get all schedules for a specific location
  static async getSchedulesByLocationId(locationId: number) {
    return await db
      .select()
      .from(clinicLocationSchedules)
      .where(eq(clinicLocationSchedules.locationId, locationId))
      .orderBy(desc(clinicLocationSchedules.effectiveFrom));
  }

  // Get all schedules for a clinic
  static async getSchedulesByClinicId(clinicId: number) {
    return await db
      .select({
        schedule: clinicLocationSchedules,
        location: clinicLocations
      })
      .from(clinicLocationSchedules)
      .leftJoin(clinicLocations, eq(clinicLocationSchedules.locationId, clinicLocations.id))
      .where(eq(clinicLocationSchedules.clinicId, clinicId))
      .orderBy(desc(clinicLocationSchedules.effectiveFrom));
  }

  // Get active schedules for a location
  static async getActiveSchedulesByLocationId(locationId: number) {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    
    return await db
      .select()
      .from(clinicLocationSchedules)
      .where(
        and(
          eq(clinicLocationSchedules.locationId, locationId),
          eq(clinicLocationSchedules.isActive, true),
          gte(clinicLocationSchedules.effectiveFrom, today),
          or(
            isNull(clinicLocationSchedules.effectiveTo),
            gte(clinicLocationSchedules.effectiveTo, today)
          )
        )
      )
      .orderBy(desc(clinicLocationSchedules.effectiveFrom));
  }

  // Get current active schedule for a location
  static async getCurrentActiveSchedule(locationId: number) {
    const today = new Date().toISOString().split('T')[0];
    
    const schedules = await db
      .select()
      .from(clinicLocationSchedules)
      .where(
        and(
          eq(clinicLocationSchedules.locationId, locationId),
          eq(clinicLocationSchedules.isActive, true),
          gte(clinicLocationSchedules.effectiveFrom, today),
          or(
            isNull(clinicLocationSchedules.effectiveTo),
            gte(clinicLocationSchedules.effectiveTo, today)
          )
        )
      )
      .orderBy(desc(clinicLocationSchedules.effectiveFrom))
      .limit(1);
    
    return schedules[0] || null;
  }

  // Get schedule by ID
  static async getScheduleById(id: number) {
    const [schedule] = await db
      .select()
      .from(clinicLocationSchedules)
      .where(eq(clinicLocationSchedules.id, id));
    
    return schedule;
  }

  // Update a schedule
  static async updateSchedule(id: number, data: UpdateClinicLocationSchedule) {
    const [updatedSchedule] = await db
      .update(clinicLocationSchedules)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(clinicLocationSchedules.id, id))
      .returning();
    
    return updatedSchedule;
  }

  // Delete a schedule
  static async deleteSchedule(id: number) {
    const [deletedSchedule] = await db
      .delete(clinicLocationSchedules)
      .where(eq(clinicLocationSchedules.id, id))
      .returning();
    
    return deletedSchedule;
  }

  // Deactivate all schedules for a location (useful when creating a new active one)
  static async deactivateSchedulesForLocation(locationId: number) {
    await db
      .update(clinicLocationSchedules)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(clinicLocationSchedules.locationId, locationId));
  }

  // Get schedules with location details
  static async getSchedulesWithLocationDetails(clinicId: number) {
    return await db
      .select({
        schedule: clinicLocationSchedules,
        location: clinicLocations
      })
      .from(clinicLocationSchedules)
      .leftJoin(clinicLocations, eq(clinicLocationSchedules.locationId, clinicLocations.id))
      .where(eq(clinicLocationSchedules.clinicId, clinicId))
      .orderBy(desc(clinicLocationSchedules.effectiveFrom));
  }

  // Check if a location has any schedules
  static async hasSchedules(locationId: number) {
    const schedules = await db
      .select({ id: clinicLocationSchedules.id })
      .from(clinicLocationSchedules)
      .where(eq(clinicLocationSchedules.locationId, locationId))
      .limit(1);
    
    return schedules.length > 0;
  }

  // Get schedules for a specific date range
  static async getSchedulesByDateRange(locationId: number, startDate: string, endDate: string) {
    return await db
      .select()
      .from(clinicLocationSchedules)
      .where(
        and(
          eq(clinicLocationSchedules.locationId, locationId),
          or(
            and(
              gte(clinicLocationSchedules.effectiveFrom, startDate),
              lte(clinicLocationSchedules.effectiveFrom, endDate)
            ),
            and(
              gte(clinicLocationSchedules.effectiveTo, startDate),
              lte(clinicLocationSchedules.effectiveTo, endDate)
            ),
            and(
              lte(clinicLocationSchedules.effectiveFrom, startDate),
              or(
                isNull(clinicLocationSchedules.effectiveTo),
                gte(clinicLocationSchedules.effectiveTo, endDate)
              )
            )
          )
        )
      )
      .orderBy(desc(clinicLocationSchedules.effectiveFrom));
  }
} 