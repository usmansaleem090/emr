import { db } from "../../../db";
import { doctors, type Doctor, type InsertDoctor } from "./doctorSchema";
import { users } from "../securitySchema";
import { eq, and, sql } from "drizzle-orm";

export class DoctorDAL {
  static async create(doctorData: InsertDoctor): Promise<Doctor> {
    const [newDoctor] = await db
      .insert(doctors)
      .values(doctorData)
      .returning();
    
    return newDoctor;
  }

  static async findById(id: number): Promise<Doctor | undefined> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.id, id));
    
    return doctor;
  }

  static async findByUserId(userId: number): Promise<Doctor | undefined> {
    const [doctor] = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId));
    
    return doctor;
  }

  static async findByClinic(clinicId: number): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        d.id,
        d.user_id as "userId",
        d.clinic_id as "clinicId", 
        d.specialty,
        d.license_number as "licenseNumber",
        d.status,
        d.created_at as "createdAt",
        d.updated_at as "updatedAt",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.user_type as "userType",
        u.role_id as "roleId",
        r.name as "roleName"
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE d.clinic_id = ${clinicId}
      ORDER BY u.first_name, u.last_name
    `);
    
    return result.rows || [];
  }

  static async findAll(): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        d.id,
        d.user_id as "userId",
        d.clinic_id as "clinicId",
        d.specialty,
        d.license_number as "licenseNumber", 
        d.status,
        d.created_at as "createdAt",
        d.updated_at as "updatedAt",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.email,
        u.phone,
        u.user_type as "userType",
        u.role_id as "roleId",
        r.name as "roleName",
        c.name as "clinicName"
      FROM doctors d
      JOIN users u ON d.user_id = u.id
      LEFT JOIN roles r ON u.role_id = r.id
      LEFT JOIN clinics c ON d.clinic_id = c.id
      ORDER BY u.first_name, u.last_name
    `);
    
    return result.rows || [];
  }

  static async update(id: number, doctorData: Partial<InsertDoctor>): Promise<Doctor | undefined> {
    const [updatedDoctor] = await db
      .update(doctors)
      .set({
        ...doctorData,
        updatedAt: new Date()
      })
      .where(eq(doctors.id, id))
      .returning();
    
    return updatedDoctor;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(doctors).where(eq(doctors.id, id));
  }

  static async findByLicenseNumber(licenseNumber: string, excludeId?: number): Promise<Doctor | undefined> {
    let query = db.select().from(doctors).where(eq(doctors.licenseNumber, licenseNumber));
    
    if (excludeId) {
      query = query.where(and(eq(doctors.licenseNumber, licenseNumber), eq(doctors.id, excludeId)));
    }
    
    const [doctor] = await query;
    return doctor;
  }
}

export const doctorDAL = new DoctorDAL();