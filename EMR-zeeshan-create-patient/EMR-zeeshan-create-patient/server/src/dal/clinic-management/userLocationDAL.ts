import { db } from "../../../db";
import { userLocations, clinics, clinicLocations } from "../../models/clinicSchema";
import { users } from "../../models/securitySchema";
import { eq, and, desc } from "drizzle-orm";
import { InsertUserLocation, UpdateUserLocation } from "../../models/clinicSchema";

export class UserLocationDAL {
  // Get all user locations with related data
  static async getAllUserLocationsWithDetails(userId?: number, clinicId?: number, locationId?: number) {
    const baseQuery = db
      .select({
        userLocation: userLocations,
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
      .from(userLocations)
      .leftJoin(users, eq(userLocations.userId, users.id))
      .leftJoin(clinics, eq(userLocations.clinicId, clinics.id))
      .leftJoin(clinicLocations, eq(userLocations.locationId, clinicLocations.id));

    let whereConditions = [];
    
    if (userId) {
      whereConditions.push(eq(userLocations.userId, userId));
    }
    
    if (clinicId) {
      whereConditions.push(eq(userLocations.clinicId, clinicId));
    }
    
    if (locationId) {
      whereConditions.push(eq(userLocations.locationId, locationId));
    }

    if (whereConditions.length > 0) {
      return await baseQuery
        .where(and(...whereConditions))
        .orderBy(desc(userLocations.createdAt));
    }

    return await baseQuery.orderBy(desc(userLocations.createdAt));
  }

  // Get user locations by user ID
  static async getUserLocationsByUserId(userId: number) {
    return await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.userId, userId))
      .orderBy(desc(userLocations.createdAt));
  }

  // Get user locations by clinic ID
  static async getUserLocationsByClinicId(clinicId: number) {
    return await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.clinicId, clinicId))
      .orderBy(desc(userLocations.createdAt));
  }

  // Get user locations by location ID
  static async getUserLocationsByLocationId(locationId: number) {
    return await db
      .select()
      .from(userLocations)
      .where(eq(userLocations.locationId, locationId))
      .orderBy(desc(userLocations.createdAt));
  }

  // Get primary location for a user in a clinic
  static async getPrimaryUserLocation(userId: number, clinicId: number) {
    const result = await db
      .select()
      .from(userLocations)
      .where(
        and(
          eq(userLocations.userId, userId),
          eq(userLocations.clinicId, clinicId),
          eq(userLocations.isPrimary, true)
        )
      )
      .limit(1);

    return result[0] || null;
  }

  // Create user location
  static async createUserLocation(data: InsertUserLocation) {
    const result = await db
      .insert(userLocations)
      .values(data)
      .returning();

    return result[0];
  }

  // Update user location
  static async updateUserLocation(id: number, data: UpdateUserLocation) {
    const result = await db
      .update(userLocations)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(userLocations.id, id))
      .returning();

    return result[0];
  }

  // Delete user location
  static async deleteUserLocation(id: number) {
    const result = await db
      .delete(userLocations)
      .where(eq(userLocations.id, id))
      .returning();

    return result[0];
  }

  // Set primary location for a user in a clinic
  static async setPrimaryLocation(userId: number, clinicId: number, locationId: number) {
    // First, remove primary flag from all user locations in this clinic
    await db
      .update(userLocations)
      .set({ isPrimary: false })
      .where(
        and(
          eq(userLocations.userId, userId),
          eq(userLocations.clinicId, clinicId)
        )
      );

    // Then set the specified location as primary
    const result = await db
      .update(userLocations)
      .set({ isPrimary: true })
      .where(
        and(
          eq(userLocations.userId, userId),
          eq(userLocations.clinicId, clinicId),
          eq(userLocations.locationId, locationId)
        )
      )
      .returning();

    return result[0];
  }

  // Check if user has access to a specific location
  static async hasUserLocationAccess(userId: number, locationId: number) {
    const result = await db
      .select()
      .from(userLocations)
      .where(
        and(
          eq(userLocations.userId, userId),
          eq(userLocations.locationId, locationId),
          eq(userLocations.status, 'active')
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Get all locations a user has access to
  static async getUserAccessibleLocations(userId: number) {
    return await db
      .select({
        userLocation: userLocations,
        location: clinicLocations,
        clinic: {
          id: clinics.id,
          name: clinics.name,
        }
      })
      .from(userLocations)
      .leftJoin(clinicLocations, eq(userLocations.locationId, clinicLocations.id))
      .leftJoin(clinics, eq(userLocations.clinicId, clinics.id))
      .where(
        and(
          eq(userLocations.userId, userId),
          eq(userLocations.status, 'active')
        )
      )
      .orderBy(desc(userLocations.createdAt));
  }
} 