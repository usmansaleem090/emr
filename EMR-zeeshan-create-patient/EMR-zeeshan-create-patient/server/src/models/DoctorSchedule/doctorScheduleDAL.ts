import { db } from "../../../db";
import { doctorSchedules, doctorTimeOff, type DoctorSchedule, type InsertDoctorSchedule, type DoctorTimeOff, type InsertDoctorTimeOff } from "./doctorScheduleSchema";
import { doctors } from "../Doctor/doctorSchema";
// import { users } from "../User/";
import { eq, and, gte, lte, between } from "drizzle-orm";

export class DoctorScheduleDAL {
  // Schedule Management
  static async createSchedule(scheduleData: InsertDoctorSchedule): Promise<DoctorSchedule> {
    const [newSchedule] = await db
      .insert(doctorSchedules)
      .values({
        ...scheduleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return newSchedule;
  }

  static async getSchedulesByDoctorId(doctorId: number): Promise<DoctorSchedule[]> {
    return db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.doctorId, doctorId))
      .orderBy(doctorSchedules.dayOfWeek);
  }

  static async updateSchedule(id: number, scheduleData: Partial<InsertDoctorSchedule>): Promise<DoctorSchedule | undefined> {
    const [updatedSchedule] = await db
      .update(doctorSchedules)
      .set({
        ...scheduleData,
        updatedAt: new Date(),
      })
      .where(eq(doctorSchedules.id, id))
      .returning();
    
    return updatedSchedule;
  }

  static async deleteSchedule(id: number): Promise<void> {
    await db.delete(doctorSchedules).where(eq(doctorSchedules.id, id));
  }

  static async findScheduleById(id: number): Promise<DoctorSchedule | undefined> {
    const [schedule] = await db
      .select()
      .from(doctorSchedules)
      .where(eq(doctorSchedules.id, id));
    
    return schedule;
  }

  // Check if doctor is available on a specific day and time
  static async isDoctorAvailable(doctorId: number, dayOfWeek: number, time: string): Promise<boolean> {
    const schedules = await db
      .select()
      .from(doctorSchedules)
      .where(
        and(
          eq(doctorSchedules.doctorId, doctorId),
          eq(doctorSchedules.dayOfWeek, dayOfWeek),
          eq(doctorSchedules.isActive, true)
        )
      );

    for (const schedule of schedules) {
      if (time >= schedule.startTime && time <= schedule.endTime) {
        // Check if it's during break time
        if (schedule.breakStartTime && schedule.breakEndTime) {
          if (time >= schedule.breakStartTime && time <= schedule.breakEndTime) {
            continue; // During break, not available
          }
        }
        return true; // Available during working hours
      }
    }

    return false; // Not available
  }

  // Time Off Management
  static async createTimeOff(timeOffData: InsertDoctorTimeOff): Promise<DoctorTimeOff> {
    const [newTimeOff] = await db
      .insert(doctorTimeOff)
      .values({
        ...timeOffData,
        startDate: new Date(timeOffData.startDate),
        endDate: new Date(timeOffData.endDate),
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return newTimeOff;
  }

  static async getTimeOffByDoctorId(doctorId: number): Promise<DoctorTimeOff[]> {
    return db
      .select()
      .from(doctorTimeOff)
      .where(eq(doctorTimeOff.doctorId, doctorId))
      .orderBy(doctorTimeOff.startDate);
  }

  static async updateTimeOff(id: number, timeOffData: Partial<InsertDoctorTimeOff>): Promise<DoctorTimeOff | undefined> {
    const updateData: any = {
      ...timeOffData,
      updatedAt: new Date(),
    };

    if (timeOffData.startDate) {
      updateData.startDate = new Date(timeOffData.startDate);
    }
    if (timeOffData.endDate) {
      updateData.endDate = new Date(timeOffData.endDate);
    }

    const [updatedTimeOff] = await db
      .update(doctorTimeOff)
      .set(updateData)
      .where(eq(doctorTimeOff.id, id))
      .returning();
    
    return updatedTimeOff;
  }

  static async deleteTimeOff(id: number): Promise<void> {
    await db.delete(doctorTimeOff).where(eq(doctorTimeOff.id, id));
  }

  static async findTimeOffById(id: number): Promise<DoctorTimeOff | undefined> {
    const [timeOff] = await db
      .select()
      .from(doctorTimeOff)
      .where(eq(doctorTimeOff.id, id));
    
    return timeOff;
  }

  // Get current and upcoming time off for a doctor
  static async getUpcomingTimeOff(doctorId: number): Promise<DoctorTimeOff[]> {
    const today = new Date();
    return db
      .select()
      .from(doctorTimeOff)
      .where(
        and(
          eq(doctorTimeOff.doctorId, doctorId),
          gte(doctorTimeOff.endDate, today)
        )
      )
      .orderBy(doctorTimeOff.startDate);
  }

  // Check if doctor is on time off for a specific date
  static async isDoctorOnTimeOff(doctorId: number, date: Date): Promise<boolean> {
    const timeOffRecords = await db
      .select()
      .from(doctorTimeOff)
      .where(
        and(
          eq(doctorTimeOff.doctorId, doctorId),
          lte(doctorTimeOff.startDate, date),
          gte(doctorTimeOff.endDate, date)
        )
      );

    return timeOffRecords.length > 0;
  }

  // Get doctor's complete schedule with personal info
  static async getDoctorScheduleWithInfo(doctorId: number) {
    // const result = await db
    //   .select({
    //     doctor: doctors,
    //     user: {
    //       firstName: users.firstName,
    //       lastName: users.lastName,
    //       email: users.email,
    //     },
    //     schedules: doctorSchedules,
    //   })
    //   .from(doctors)
    //   .innerJoin(users, eq(doctors.userId, users.id))
    //   .leftJoin(doctorSchedules, eq(doctorSchedules.doctorId, doctors.id))
    //   .where(eq(doctors.id, doctorId));

    // if (result.length === 0) return null;

    // const doctor = result[0].doctor;
    // const user = result[0].user;
    // const schedules = result
    //   .filter(r => r.schedules)
    //   .map(r => r.schedules)
    //   .filter(Boolean);

    // return {
    //   doctor,
    //   user,
    //   schedules,
    // };
  }
}