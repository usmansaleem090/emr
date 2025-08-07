import express from 'express';
import { AppointmentDAL } from '../models/Appointment/appointmentDAL';
import { insertAppointmentSchema } from '../models/Appointment/appointmentSchema';
import { authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

// Get appointments for a clinic
router.get('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Get clinic ID from user or query parameter
    let clinicId = user.clinicId;
    const locationId = req.query.locationId ? parseInt(req.query.locationId as string) : undefined;
    
    if (!clinicId) {
      return res.status(400).json({
        success: false,
        message: 'Clinic ID is required',
      });
    }
    
    const appointments = await AppointmentDAL.getClinicAppointments(clinicId, locationId);
    
    res.json({
      success: true,
      data: appointments,
      message: 'Appointments retrieved successfully',
    });
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get appointment by ID
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID',
      });
    }
    
    const appointment = await AppointmentDAL.getAppointmentById(appointmentId);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get available slots for a doctor
router.get('/slots/:doctorId/:date/:locationId', authenticateToken, async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const date = req.params.date;
    const locationId = parseInt(req.params.locationId);
    
    if (isNaN(doctorId) || isNaN(locationId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid doctor ID or location ID',
      });
    }
    
    // Validate date format
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format. Use YYYY-MM-DD',
      });
    }
    
    const slots = await AppointmentDAL.getAvailableSlots(doctorId, date, locationId);
    
    res.json({
      success: true,
      data: slots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Create new appointment
router.post('/', authenticateToken, async (req, res) => {
  try {
    const user = (req as any).user;
    
    // Validate request body
    const validationResult = insertAppointmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors,
      });
    }
    
    const appointmentData = validationResult.data;
    
    // Set clinic ID and created by from user
    appointmentData.clinicId = user.clinicId;
    appointmentData.createdBy = user.id;
    
    // Check for appointment conflicts
    const hasConflict = await AppointmentDAL.checkAppointmentConflict(
      appointmentData.doctorId,
      appointmentData.appointmentDate,
      appointmentData.startTime,
      appointmentData.endTime
    );
    
    if (hasConflict) {
      return res.status(400).json({
        success: false,
        message: 'This time slot conflicts with an existing appointment',
      });
    }
    
    const appointment = await AppointmentDAL.createAppointment(appointmentData);
    
    res.status(201).json({
      success: true,
      data: appointment,
      message: 'Appointment created successfully',
    });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Update appointment
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID',
      });
    }
    
    // Validate request body (partial update)
    const validationResult = insertAppointmentSchema.partial().safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: validationResult.error.errors,
      });
    }
    
    const updates = validationResult.data;
    
    // If updating time, check for conflicts
    if (updates.startTime || updates.endTime || updates.appointmentDate) {
      const existingAppointment = await AppointmentDAL.getAppointmentById(appointmentId);
      if (!existingAppointment) {
        return res.status(404).json({
          success: false,
          message: 'Appointment not found',
        });
      }
      
      const hasConflict = await AppointmentDAL.checkAppointmentConflict(
        updates.doctorId || existingAppointment.doctorId,
        updates.appointmentDate || existingAppointment.appointmentDate,
        updates.startTime || existingAppointment.startTime,
        updates.endTime || existingAppointment.endTime,
        appointmentId
      );
      
      if (hasConflict) {
        return res.status(400).json({
          success: false,
          message: 'This time slot conflicts with an existing appointment',
        });
      }
    }
    
    const appointment = await AppointmentDAL.updateAppointment(appointmentId, updates);
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment updated successfully',
    });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Cancel appointment
router.patch('/:id/cancel', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID',
      });
    }
    
    const appointment = await AppointmentDAL.updateAppointment(appointmentId, { 
      status: 'cancelled' 
    });
    
    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    res.json({
      success: true,
      data: appointment,
      message: 'Appointment cancelled successfully',
    });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Delete appointment
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const appointmentId = parseInt(req.params.id);
    if (isNaN(appointmentId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid appointment ID',
      });
    }
    
    const deleted = await AppointmentDAL.deleteAppointment(appointmentId);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found',
      });
    }
    
    res.json({
      success: true,
      message: 'Appointment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

// Get available time slots for a doctor on a specific date at a location
router.get('/slots/:doctorId/:date/:locationId', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, locationId } = req.params;
    
    // Generate all possible slots (9 AM to 5 PM, 30-minute slots)
    const allSlots = [];
    for (let hour = 9; hour < 17; hour++) {
      allSlots.push(`${hour.toString().padStart(2, '0')}:00`);
      allSlots.push(`${hour.toString().padStart(2, '0')}:30`);
    }
    
    // Get existing appointments for this doctor on this date
    const existingAppointments = await AppointmentDAL.getAppointmentsByDoctorAndDate(
      parseInt(doctorId), 
      date
    );
    
    // Filter out booked slots
    const bookedSlots = existingAppointments.map((apt: any) => apt.startTime);
    const availableSlots = allSlots.filter(slot => !bookedSlots.includes(slot));
    
    res.json({
      success: true,
      data: availableSlots,
      message: 'Available slots retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Get available time slots for a doctor on a specific date
router.get('/available-slots', authenticateToken, async (req, res) => {
  try {
    const { doctorId, date, locationId } = req.query;
    
    if (!doctorId || !date || !locationId) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, date, and location ID are required',
      });
    }

    const availableSlots = await AppointmentDAL.getAvailableSlots(
      parseInt(doctorId as string),
      date as string,
      parseInt(locationId as string)
    );

    res.json({
      success: true,
      data: availableSlots,
    });
  } catch (error) {
    console.error('Error fetching available slots:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
});

export default router;