import { Router } from 'express';
import { ClinicController } from '../controllers/clinic-management/clinicController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = Router();

// Get all clinics
router.get('/', authMiddleware, ClinicController.getAllClinics);

// Get clinic by ID
router.get('/:id', authMiddleware, ClinicController.getClinicById);

// Create new clinic
router.post('/', authMiddleware, ClinicController.createClinic);

// Update clinic
router.put('/:id', authMiddleware, ClinicController.updateClinic);

// Delete clinic
router.delete('/:id', authMiddleware, ClinicController.deleteClinic);

export default router; 