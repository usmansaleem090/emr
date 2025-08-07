import { Router } from 'express';
import { UserLocationController } from '../../controllers/clinic-management/userLocationController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// ===== USER LOCATIONS ROUTES =====

// Get all user locations with optional filters
router.get('/user-locations', authMiddleware, UserLocationController.getAllUserLocations);

// Get user locations by user ID
router.get('/user-locations/user/:userId', authMiddleware, UserLocationController.getUserLocationsByUserId);

// Get user locations by clinic ID
router.get('/user-locations/clinic/:clinicId', authMiddleware, UserLocationController.getUserLocationsByClinicId);

// Get user locations by location ID
router.get('/user-locations/location/:locationId', authMiddleware, UserLocationController.getUserLocationsByLocationId);

// Get primary location for a user in a clinic
router.get('/user-locations/primary/:userId/:clinicId', authMiddleware, UserLocationController.getPrimaryUserLocation);

// Create user location
router.post('/user-locations', authMiddleware, UserLocationController.createUserLocation);

// Update user location
router.put('/user-locations/:id', authMiddleware, UserLocationController.updateUserLocation);

// Delete user location
router.delete('/user-locations/:id', authMiddleware, UserLocationController.deleteUserLocation);

// Set primary location for a user in a clinic
router.put('/user-locations/primary/:userId/:clinicId/:locationId', authMiddleware, UserLocationController.setPrimaryLocation);

// Check if user has access to a specific location
router.get('/user-locations/access/:userId/:locationId', authMiddleware, UserLocationController.checkUserLocationAccess);

// Get all locations a user has access to
router.get('/user-locations/accessible/:userId', authMiddleware, UserLocationController.getUserAccessibleLocations);

export default router; 