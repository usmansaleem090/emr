import { db } from '../../../db';
import { schedules } from './scheduleSchema';
import { eq, and, desc, lte, gte, or, isNull } from 'drizzle-orm';
import { InsertSchedule, UpdateSchedule, Schedule } from './scheduleSchema';

export class ScheduleDAL {
  /**
   * Create a new schedule
   */
  static async createSchedule(scheduleData: InsertSchedule): Promise<Schedule> {
    try {
      const [schedule] = await db
        .insert(schedules)
        .values(scheduleData)
        .returning();

      return schedule;
    } catch (error) {
      console.error('Error creating schedule:', error);
      throw new Error('Failed to create schedule');
    }
  }

  /**
   * Update an existing schedule
   */
  static async updateSchedule(id: number, scheduleData: UpdateSchedule): Promise<Schedule | null> {
    try {
      const [schedule] = await db
        .update(schedules)
        .set({
          ...scheduleData,
          updatedAt: new Date()
        })
        .where(eq(schedules.id, id))
        .returning();

      return schedule || null;
    } catch (error) {
      console.error('Error updating schedule:', error);
      throw new Error('Failed to update schedule');
    }
  }

  /**
   * Get schedule by ID
   */
  static async getScheduleById(id: number): Promise<Schedule | null> {
    try {
      const [schedule] = await db
        .select()
        .from(schedules)
        .where(eq(schedules.id, id));

      return schedule || null;
    } catch (error) {
      console.error('Error getting schedule by ID:', error);
      throw new Error('Failed to get schedule');
    }
  }

  /**
   * Get all schedules for a specific user
   */
  static async getSchedulesByUserId(userId: number): Promise<Schedule[]> {
    try {
      const userSchedules = await db
        .select()
        .from(schedules)
        .where(eq(schedules.userId, userId))
        .orderBy(desc(schedules.createdAt));

      return userSchedules;
    } catch (error) {
      console.error('Error getting schedules by user ID:', error);
      throw new Error('Failed to get user schedules');
    }
  }

  /**
   * Get all schedules for a specific clinic
   */
  static async getSchedulesByClinicId(clinicId: number): Promise<Schedule[]> {
    try {
      const clinicSchedules = await db
        .select()
        .from(schedules)
        .where(eq(schedules.clinicId, clinicId))
        .orderBy(desc(schedules.createdAt));

      return clinicSchedules;
    } catch (error) {
      console.error('Error getting schedules by clinic ID:', error);
      throw new Error('Failed to get clinic schedules');
    }
  }

  /**
   * Get active schedules for a specific user
   */
  static async getActiveSchedulesByUserId(userId: number): Promise<Schedule[]> {
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const activeSchedules = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.userId, userId),
            eq(schedules.isActive, true),
            lte(schedules.effectiveFrom, currentDate),
            or(
              isNull(schedules.effectiveTo),
              gte(schedules.effectiveTo, currentDate)
            )
          )
        )
        .orderBy(desc(schedules.effectiveFrom));

      return activeSchedules;
    } catch (error) {
      console.error('Error getting active schedules by user ID:', error);
      throw new Error('Failed to get active user schedules');
    }
  }

  /**
   * Get active schedules for a specific clinic
   */
  static async getActiveSchedulesByClinicId(clinicId: number): Promise<Schedule[]> {
    try {
      const currentDate = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const activeSchedules = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.clinicId, clinicId),
            eq(schedules.isActive, true),
            lte(schedules.effectiveFrom, currentDate),
            or(
              isNull(schedules.effectiveTo),
              gte(schedules.effectiveTo, currentDate)
            )
          )
        )
        .orderBy(desc(schedules.effectiveFrom));

      return activeSchedules;
    } catch (error) {
      console.error('Error getting active schedules by clinic ID:', error);
      throw new Error('Failed to get active clinic schedules');
    }
  }

  /**
   * Get schedules by user type (doctor or staff)
   */
  static async getSchedulesByUserType(clinicId: number, userType: 'doctor' | 'staff'): Promise<Schedule[]> {
    try {
      const schedulesByType = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.clinicId, clinicId),
            eq(schedules.userType, userType)
          )
        )
        .orderBy(desc(schedules.createdAt));

      return schedulesByType;
    } catch (error) {
      console.error('Error getting schedules by user type:', error);
      throw new Error('Failed to get schedules by user type');
    }
  }

  /**
   * Delete a schedule
   */
  static async deleteSchedule(id: number): Promise<boolean> {
    try {
      const [deletedSchedule] = await db
        .delete(schedules)
        .where(eq(schedules.id, id))
        .returning();

      return !!deletedSchedule;
    } catch (error) {
      console.error('Error deleting schedule:', error);
      throw new Error('Failed to delete schedule');
    }
  }

  /**
   * Check if a user already has an active schedule
   */
  static async hasActiveSchedule(userId: number): Promise<boolean> {
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      const [existingSchedule] = await db
        .select()
        .from(schedules)
        .where(
          and(
            eq(schedules.userId, userId),
            eq(schedules.isActive, true),
            lte(schedules.effectiveFrom, currentDate),
            or(
              isNull(schedules.effectiveTo),
              gte(schedules.effectiveTo, currentDate)
            )
          )
        );

      return !!existingSchedule;
    } catch (error) {
      console.error('Error checking active schedule:', error);
      throw new Error('Failed to check active schedule');
    }
  }

  /**
   * Get all schedules with pagination
   */
  static async getAllSchedules(limit: number = 50, offset: number = 0): Promise<Schedule[]> {
    try {
      const allSchedules = await db
        .select()
        .from(schedules)
        .limit(limit)
        .offset(offset)
        .orderBy(desc(schedules.createdAt));

      return allSchedules;
    } catch (error) {
      console.error('Error getting all schedules:', error);
      throw new Error('Failed to get all schedules');
    }
  }
} 