import { Router } from 'express';
import { ClinicLocationScheduleController } from '../../controllers/clinic-management/clinicLocationScheduleController';
import { authMiddleware } from '../../middleware/authMiddleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Get all schedules for a clinic
router.get('/clinics/:clinicId/schedules', ClinicLocationScheduleController.getSchedulesByClinic);

// Get all schedules for a specific location
router.get('/locations/:locationId/schedules', ClinicLocationScheduleController.getSchedulesByLocation);

// Get current active schedule for a location
router.get('/locations/:locationId/schedules/current', ClinicLocationScheduleController.getCurrentActiveSchedule);

// Get schedules for a date range
router.get('/locations/:locationId/schedules/range', ClinicLocationScheduleController.getSchedulesByDateRange);

// Get schedule by ID
router.get('/schedules/:id', ClinicLocationScheduleController.getScheduleById);

// Create a new schedule
router.post('/clinics/:clinicId/schedules', ClinicLocationScheduleController.createSchedule);

// Update a schedule
router.put('/schedules/:id', ClinicLocationScheduleController.updateSchedule);

// Delete a schedule
router.delete('/schedules/:id', ClinicLocationScheduleController.deleteSchedule);

export default router; 