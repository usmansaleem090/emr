import { db } from '../../../db';
import { clinicLocationServices, clinicLocations } from '../../models/clinicSchema';
import { eq, and } from 'drizzle-orm';
import type { 
  ClinicLocationService, 
  InsertClinicLocationService, 
  UpdateClinicLocationService 
} from '../../models/clinicSchema';

export class LocationServiceDAL {
  // Get all location services for a clinic
  static async getLocationServicesByClinicId(clinicId: number): Promise<ClinicLocationService[]> {
    return await db
      .select()
      .from(clinicLocationServices)
      .where(eq(clinicLocationServices.clinicId, clinicId));
  }

  // Get services for a specific location
  static async getServicesByLocationId(locationId: number): Promise<ClinicLocationService[]> {
    return await db
      .select()
      .from(clinicLocationServices)
      .where(eq(clinicLocationServices.locationId, locationId));
  }

  // Get location services with location details
  static async getLocationServicesWithDetails(clinicId: number): Promise<any[]> {
    return await db
      .select({
        id: clinicLocationServices.id,
        clinicId: clinicLocationServices.clinicId,
        locationId: clinicLocationServices.locationId,
        serviceName: clinicLocationServices.serviceName,
        serviceCategory: clinicLocationServices.serviceCategory,
        isActive: clinicLocationServices.isActive,
        createdAt: clinicLocationServices.createdAt,
        updatedAt: clinicLocationServices.updatedAt,
        locationName: clinicLocations.name,
        locationAddress: clinicLocations.address,
      })
      .from(clinicLocationServices)
      .innerJoin(clinicLocations, eq(clinicLocationServices.locationId, clinicLocations.id))
      .where(eq(clinicLocationServices.clinicId, clinicId));
  }

  // Get location service by ID
  static async getLocationServiceById(id: number): Promise<ClinicLocationService | undefined> {
    const [service] = await db
      .select()
      .from(clinicLocationServices)
      .where(eq(clinicLocationServices.id, id));
    return service;
  }

  // Create a new location service
  static async createLocationService(data: InsertClinicLocationService): Promise<ClinicLocationService> {
    const [service] = await db
      .insert(clinicLocationServices)
      .values(data)
      .returning();
    return service;
  }

  // Update location service
  static async updateLocationService(id: number, data: Partial<InsertClinicLocationService>): Promise<ClinicLocationService | undefined> {
    const [service] = await db
      .update(clinicLocationServices)
      .set(data)
      .where(eq(clinicLocationServices.id, id))
      .returning();
    return service;
  }

  // Delete location service
  static async deleteLocationService(id: number): Promise<void> {
    await db
      .delete(clinicLocationServices)
      .where(eq(clinicLocationServices.id, id));
  }

  // Bulk update location services (delete all existing and insert new ones)
  static async bulkUpdateLocationServices(clinicId: number, locationServices: Array<{
    locationId: number;
    services: Array<{ serviceName: string; serviceCategory: string }>;
  }>): Promise<void> {
    // Delete all existing services for this clinic
    await db
      .delete(clinicLocationServices)
      .where(eq(clinicLocationServices.clinicId, clinicId));

    // Insert new services
    const servicesToInsert: InsertClinicLocationService[] = [];
    
    for (const locationService of locationServices) {
      for (const service of locationService.services) {
        servicesToInsert.push({
          clinicId,
          locationId: locationService.locationId,
          serviceName: service.serviceName,
          serviceCategory: service.serviceCategory,
          isActive: true
        });
      }
    }

    if (servicesToInsert.length > 0) {
      await db
        .insert(clinicLocationServices)
        .values(servicesToInsert);
    }
  }

  // Get all location services (for patient booking system)
  static async getAllLocationServices(): Promise<ClinicLocationService[]> {
    return await db
      .select()
      .from(clinicLocationServices);
  }
} 