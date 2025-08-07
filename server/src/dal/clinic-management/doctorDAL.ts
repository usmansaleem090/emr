import { db } from "../../../db";
import { clinics, clinicLocations } from "../../models";
import { users } from "../../models/securitySchema";
import { doctors } from "../../models/Doctor/doctorSchema";
import { eq, and, desc } from "drizzle-orm";
import { InsertDoctor, UpdateDoctor } from "../../models/Doctor/doctorSchema";

export class DoctorDAL {
  // Get all doctors with user information
  static async getAllDoctorsWithUsers(clinicId?: number, locationId?: number) {
    const baseQuery = db
      .select({
        doctor: doctors,
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
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(doctors.locationId, clinicLocations.id));

    let whereConditions = [];
    
    if (clinicId) {
      whereConditions.push(eq(doctors.clinicId, clinicId));
    }
    
    if (locationId) {
      whereConditions.push(eq(doctors.locationId, locationId));
    }

    if (whereConditions.length > 0) {
      return await baseQuery
        .where(and(...whereConditions))
        .orderBy(desc(doctors.createdAt));
    }

    return await baseQuery.orderBy(desc(doctors.createdAt));
  }

  // Get doctor by ID with user information
  static async getDoctorByIdWithUser(id: number) {
    const result = await db
      .select({
        doctor: doctors,
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
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(doctors.locationId, clinicLocations.id))
      .where(eq(doctors.id, id))
      .limit(1);

    return result[0] || null;
  }

  // Create doctor
  static async createDoctor(data: InsertDoctor) {
    const result = await db
      .insert(doctors)
      .values(data)
      .returning();

    return result[0];
  }

  // Update doctor
  static async updateDoctor(id: number, data: UpdateDoctor) {
    const result = await db
      .update(doctors)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(doctors.id, id))
      .returning();

    return result[0];
  }

  // Delete doctor
  static async deleteDoctor(id: number) {
    const result = await db
      .delete(doctors)
      .where(eq(doctors.id, id))
      .returning();

    return result[0];
  }

  // Get doctors by clinic and location
  static async getDoctorsByClinicAndLocation(clinicId: number, locationId: number) {
    return await db
      .select({
        doctor: doctors,
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
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(doctors.locationId, clinicLocations.id))
      .where(
        and(
          eq(doctors.clinicId, clinicId),
          eq(doctors.locationId, locationId)
        )
      )
      .orderBy(desc(doctors.createdAt));
  }

  // Get doctor by user ID
  static async getDoctorByUserId(userId: number) {
    const result = await db
      .select()
      .from(doctors)
      .where(eq(doctors.userId, userId))
      .limit(1);

    return result[0] || null;
  }

  // Get doctors by specialty
  static async getDoctorsBySpecialty(specialty: string, clinicId?: number, locationId?: number) {
    const baseQuery = db
      .select({
        doctor: doctors,
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
      .from(doctors)
      .leftJoin(users, eq(doctors.userId, users.id))
      .leftJoin(clinics, eq(doctors.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(doctors.locationId, clinicLocations.id))
      .where(eq(doctors.specialty, specialty));

    let whereConditions = [eq(doctors.specialty, specialty)];
    
    if (clinicId) {
      whereConditions.push(eq(doctors.clinicId, clinicId));
    }
    
    if (locationId) {
      whereConditions.push(eq(doctors.locationId, locationId));
    }

    return await baseQuery
      .where(and(...whereConditions))
      .orderBy(desc(doctors.createdAt));
  }
} 