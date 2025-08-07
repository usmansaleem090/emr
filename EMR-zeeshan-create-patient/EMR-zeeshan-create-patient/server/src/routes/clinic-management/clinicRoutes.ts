import { Router } from 'express';
import { ClinicController } from '../../controllers/clinic-management/clinicController';
import { UserLocationController } from '../../controllers/clinic-management/userLocationController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// ===== CLINIC CRUD ROUTES =====

// Get all clinics
router.get('/clinics', authMiddleware, ClinicController.getAllClinics);

// Get clinic by ID
router.get('/clinics/:id', authMiddleware, ClinicController.getClinicById);

// Create new clinic
router.post('/clinics', authMiddleware, ClinicController.createClinic);

// Update clinic
router.put('/clinics/:id', authMiddleware, ClinicController.updateClinic);

// Delete clinic
router.delete('/clinics/:id', authMiddleware, ClinicController.deleteClinic);

// ===== CLINIC SETTINGS ROUTES =====

// Get clinic settings
router.get('/clinics/:clinicId/settings', authMiddleware, ClinicController.getClinicSettings);

// Create clinic settings
router.post('/clinics/:clinicId/settings', authMiddleware, ClinicController.createClinicSettings);

// Update clinic settings
router.put('/clinics/:clinicId/settings', authMiddleware, ClinicController.updateClinicSettings);

// Delete clinic settings
router.delete('/clinics/:clinicId/settings', authMiddleware, ClinicController.deleteClinicSettings);

// ===== CLINIC SPECIALTIES ROUTES =====

// Get all available specialties
router.get('/specialties', authMiddleware, ClinicController.getAllSpecialties);

// Get clinic specialties
router.get('/clinics/:clinicId/specialties', authMiddleware, ClinicController.getClinicSpecialties);

// Save clinic specialties
router.post('/clinics/:clinicId/specialties', authMiddleware, ClinicController.saveClinicSpecialties);

// Update clinic specialties
router.put('/clinics/:clinicId/specialties', authMiddleware, ClinicController.updateClinicSpecialties);

// Delete clinic specialties
router.delete('/clinics/:clinicId/specialties', authMiddleware, ClinicController.deleteClinicSpecialties);

// ===== CLINIC INSURANCES ROUTES =====

// Get all available insurance providers
router.get('/insurance-providers', authMiddleware, ClinicController.getAllInsuranceProviders);

// Get clinic insurances
router.get('/clinics/:clinicId/insurances', authMiddleware, ClinicController.getClinicInsurances);

// Save clinic insurances
router.post('/clinics/:clinicId/insurances', authMiddleware, ClinicController.saveClinicInsurances);

// Update clinic insurances
router.put('/clinics/:clinicId/insurances', authMiddleware, ClinicController.updateClinicInsurances);

// Delete clinic insurances
router.delete('/clinics/:clinicId/insurances', authMiddleware, ClinicController.deleteClinicInsurances);

// ===== CLINIC LOCATIONS ROUTES =====

// Get clinic locations
router.get('/clinics/:clinicId/locations', authMiddleware, ClinicController.getClinicLocations);

// Save clinic locations
router.post('/clinics/:clinicId/locations', authMiddleware, ClinicController.saveClinicLocations);

// Update clinic locations
router.put('/clinics/:clinicId/locations', authMiddleware, ClinicController.updateClinicLocations);

// Delete clinic locations
router.delete('/clinics/:clinicId/locations', authMiddleware, ClinicController.deleteClinicLocations);

// ===== CLINIC LOCATION SERVICES ROUTES =====

// Get clinic location services
router.get('/clinics/:clinicId/location-services', authMiddleware, ClinicController.getClinicLocationServices);

// Save clinic location services
router.post('/clinics/:clinicId/location-services', authMiddleware, ClinicController.saveClinicLocationServices);

// Update clinic location services
router.put('/clinics/:clinicId/location-services', authMiddleware, ClinicController.updateClinicLocationServices);

// Delete clinic location services
router.delete('/clinics/:clinicId/location-services', authMiddleware, ClinicController.deleteClinicLocationServices);

// ===== CLINIC LOCATION SCHEDULES ROUTES =====

// Get all schedules for a clinic
router.get('/clinics/:clinicId/schedules', authMiddleware, ClinicController.getSchedulesByClinic);

// Get all schedules for a specific location
router.get('/locations/:locationId/schedules', authMiddleware, ClinicController.getSchedulesByLocation);

// Get current active schedule for a location
router.get('/locations/:locationId/schedules/current', authMiddleware, ClinicController.getCurrentActiveSchedule);

// Get schedules for a date range
router.get('/locations/:locationId/schedules/range', authMiddleware, ClinicController.getSchedulesByDateRange);

// Get schedule by ID
router.get('/schedules/:id', authMiddleware, ClinicController.getScheduleById);

// Create a new schedule
router.post('/clinics/:clinicId/schedules', authMiddleware, ClinicController.createSchedule);

// Update a schedule
router.put('/schedules/:id', authMiddleware, ClinicController.updateSchedule);

// Delete a schedule
router.delete('/schedules/:id', authMiddleware, ClinicController.deleteSchedule);
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