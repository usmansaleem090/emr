import { Request, Response } from 'express';
import { UserLocationDAL } from '../../dal/clinic-management/userLocationDAL';
import { insertUserLocationSchema, updateUserLocationSchema } from '../../models/clinicSchema';
import { createResponse } from '../../utils/helpers';

export class UserLocationController {
  // Get all user locations with optional filters
  static async getAllUserLocations(req: Request, res: Response) {
    try {
      const { userId, clinicId, locationId } = req.query;
      
      const filters = {
        userId: userId ? parseInt(userId as string) : undefined,
        clinicId: clinicId ? parseInt(clinicId as string) : undefined,
        locationId: locationId ? parseInt(locationId as string) : undefined,
      };

      const userLocations = await UserLocationDAL.getAllUserLocationsWithDetails(
        filters.userId,
        filters.clinicId,
        filters.locationId
      );

      return createResponse(res, 200, 'User locations retrieved successfully', userLocations);
    } catch (error: any) {
      console.error('Error getting user locations:', error);
      return createResponse(res, 500, 'Failed to retrieve user locations', null, error.message);
    }
  }

  // Get user locations by user ID
  static async getUserLocationsByUserId(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const userLocations = await UserLocationDAL.getUserLocationsByUserId(parseInt(userId));

      return createResponse(res, 200, 'User locations retrieved successfully', userLocations);
    } catch (error: any) {
      console.error('Error getting user locations by user ID:', error);
      return createResponse(res, 500, 'Failed to retrieve user locations', null, error.message);
    }
  }

  // Get user locations by clinic ID
  static async getUserLocationsByClinicId(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const userLocations = await UserLocationDAL.getUserLocationsByClinicId(parseInt(clinicId));

      return createResponse(res, 200, 'User locations retrieved successfully', userLocations);
    } catch (error: any) {
      console.error('Error getting user locations by clinic ID:', error);
      return createResponse(res, 500, 'Failed to retrieve user locations', null, error.message);
    }
  }

  // Get user locations by location ID
  static async getUserLocationsByLocationId(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const userLocations = await UserLocationDAL.getUserLocationsByLocationId(parseInt(locationId));

      return createResponse(res, 200, 'User locations retrieved successfully', userLocations);
    } catch (error: any) {
      console.error('Error getting user locations by location ID:', error);
      return createResponse(res, 500, 'Failed to retrieve user locations', null, error.message);
    }
  }

  // Get primary location for a user in a clinic
  static async getPrimaryUserLocation(req: Request, res: Response) {
    try {
      const { userId, clinicId } = req.params;
      const primaryLocation = await UserLocationDAL.getPrimaryUserLocation(
        parseInt(userId),
        parseInt(clinicId)
      );

      if (!primaryLocation) {
        return createResponse(res, 404, 'No primary location found for this user in the clinic', null);
      }

      return createResponse(res, 200, 'Primary user location retrieved successfully', primaryLocation);
    } catch (error: any) {
      console.error('Error getting primary user location:', error);
      return createResponse(res, 500, 'Failed to retrieve primary user location', null, error.message);
    }
  }

  // Create user location
  static async createUserLocation(req: Request, res: Response) {
    try {
      const validationResult = insertUserLocationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return createResponse(res, 400, 'Validation failed', null, validationResult.error.errors);
      }

      const userLocation = await UserLocationDAL.createUserLocation(validationResult.data);

      return createResponse(res, 201, 'User location created successfully', userLocation);
    } catch (error: any) {
      console.error('Error creating user location:', error);
      return createResponse(res, 500, 'Failed to create user location', null, error.message);
    }
  }

  // Update user location
  static async updateUserLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const validationResult = updateUserLocationSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return createResponse(res, 400, 'Validation failed', null, validationResult.error.errors);
      }

      const userLocation = await UserLocationDAL.updateUserLocation(parseInt(id), validationResult.data);

      if (!userLocation) {
        return createResponse(res, 404, 'User location not found', null);
      }

      return createResponse(res, 200, 'User location updated successfully', userLocation);
    } catch (error: any) {
      console.error('Error updating user location:', error);
      return createResponse(res, 500, 'Failed to update user location', null, error.message);
    }
  }

  // Delete user location
  static async deleteUserLocation(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userLocation = await UserLocationDAL.deleteUserLocation(parseInt(id));

      if (!userLocation) {
        return createResponse(res, 404, 'User location not found', null);
      }

      return createResponse(res, 200, 'User location deleted successfully', userLocation);
    } catch (error: any) {
      console.error('Error deleting user location:', error);
      return createResponse(res, 500, 'Failed to delete user location', null, error.message);
    }
  }

  // Set primary location for a user in a clinic
  static async setPrimaryLocation(req: Request, res: Response) {
    try {
      const { userId, clinicId, locationId } = req.params;
      const userLocation = await UserLocationDAL.setPrimaryLocation(
        parseInt(userId),
        parseInt(clinicId),
        parseInt(locationId)
      );

      if (!userLocation) {
        return createResponse(res, 404, 'User location not found', null);
      }

      return createResponse(res, 200, 'Primary location set successfully', userLocation);
    } catch (error: any) {
      console.error('Error setting primary location:', error);
      return createResponse(res, 500, 'Failed to set primary location', null, error.message);
    }
  }

  // Check if user has access to a specific location
  static async checkUserLocationAccess(req: Request, res: Response) {
    try {
      const { userId, locationId } = req.params;
      const hasAccess = await UserLocationDAL.hasUserLocationAccess(
        parseInt(userId),
        parseInt(locationId)
      );

      return createResponse(res, 200, 'Access check completed', { hasAccess });
    } catch (error: any) {
      console.error('Error checking user location access:', error);
      return createResponse(res, 500, 'Failed to check user location access', null, error.message);
    }
  }

  // Get all locations a user has access to
  static async getUserAccessibleLocations(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const accessibleLocations = await UserLocationDAL.getUserAccessibleLocations(parseInt(userId));

      return createResponse(res, 200, 'Accessible locations retrieved successfully', accessibleLocations);
    } catch (error: any) {
      console.error('Error getting user accessible locations:', error);
      return createResponse(res, 500, 'Failed to retrieve accessible locations', null, error.message);
    }
  }
} 