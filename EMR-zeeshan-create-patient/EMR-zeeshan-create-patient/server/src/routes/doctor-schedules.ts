import { Router } from 'express';
import { DoctorScheduleDAL } from '../models/DoctorSchedule/doctorScheduleDAL';
import { insertDoctorScheduleSchema, updateDoctorScheduleSchema, insertDoctorTimeOffSchema, type InsertDoctorSchedule, type InsertDoctorTimeOff } from '../models/DoctorSchedule/doctorScheduleSchema';
import { z } from 'zod';

const router = Router();

// Get doctor's schedules
router.get('/doctor/:doctorId', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const schedules = await DoctorScheduleDAL.getSchedulesByDoctorId(doctorId);

    return res.json({
      success: true,
      data: schedules
    });
  } catch (error) {
    console.error('Error fetching doctor schedules:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedules'
    });
  }
});

// Get doctor's complete schedule with info
router.get('/doctor/:doctorId/complete', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const scheduleInfo = await DoctorScheduleDAL.getDoctorScheduleWithInfo(doctorId);

    if (!scheduleInfo) {
      return res.status(404).json({
        success: false,
        message: 'Doctor not found'
      });
    }

    return res.json({
      success: true,
      data: scheduleInfo
    });
  } catch (error) {
    console.error('Error fetching doctor schedule info:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor schedule info'
    });
  }
});

// Create new schedule
router.post('/', async (req, res) => {
  try {
    const validatedData = insertDoctorScheduleSchema.parse(req.body);
    const newSchedule = await DoctorScheduleDAL.createSchedule(validatedData);

    return res.status(201).json({
      success: true,
      data: newSchedule,
      message: 'Schedule created successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error creating schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create schedule'
    });
  }
});

// Update schedule
router.put('/:id', async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    const validatedData = updateDoctorScheduleSchema.parse(req.body);
    
    const updatedSchedule = await DoctorScheduleDAL.updateSchedule(scheduleId, validatedData);

    if (!updatedSchedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    return res.json({
      success: true,
      data: updatedSchedule,
      message: 'Schedule updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error updating schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update schedule'
    });
  }
});

// Delete schedule
router.delete('/:id', async (req, res) => {
  try {
    const scheduleId = parseInt(req.params.id);
    await DoctorScheduleDAL.deleteSchedule(scheduleId);

    return res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete schedule'
    });
  }
});

// Check doctor availability
router.get('/doctor/:doctorId/availability', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const { dayOfWeek, time } = req.query;

    if (!dayOfWeek || !time) {
      return res.status(400).json({
        success: false,
        message: 'dayOfWeek and time parameters are required'
      });
    }

    const isAvailable = await DoctorScheduleDAL.isDoctorAvailable(
      doctorId,
      parseInt(dayOfWeek as string),
      time as string
    );

    return res.json({
      success: true,
      data: { available: isAvailable }
    });
  } catch (error) {
    console.error('Error checking doctor availability:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check doctor availability'
    });
  }
});

// Time Off Routes

// Get doctor's time off records
router.get('/doctor/:doctorId/time-off', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const timeOffRecords = await DoctorScheduleDAL.getTimeOffByDoctorId(doctorId);

    return res.json({
      success: true,
      data: timeOffRecords
    });
  } catch (error) {
    console.error('Error fetching doctor time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch doctor time off'
    });
  }
});

// Get upcoming time off
router.get('/doctor/:doctorId/time-off/upcoming', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const upcomingTimeOff = await DoctorScheduleDAL.getUpcomingTimeOff(doctorId);

    return res.json({
      success: true,
      data: upcomingTimeOff
    });
  } catch (error) {
    console.error('Error fetching upcoming time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch upcoming time off'
    });
  }
});

// Create time off
router.post('/time-off', async (req, res) => {
  try {
    const validatedData = insertDoctorTimeOffSchema.parse(req.body);
    const newTimeOff = await DoctorScheduleDAL.createTimeOff(validatedData);

    return res.status(201).json({
      success: true,
      data: newTimeOff,
      message: 'Time off created successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error creating time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to create time off'
    });
  }
});

// Update time off
router.put('/time-off/:id', async (req, res) => {
  try {
    const timeOffId = parseInt(req.params.id);
    const validatedData = insertDoctorTimeOffSchema.partial().parse(req.body);
    
    const updatedTimeOff = await DoctorScheduleDAL.updateTimeOff(timeOffId, validatedData);

    if (!updatedTimeOff) {
      return res.status(404).json({
        success: false,
        message: 'Time off record not found'
      });
    }

    return res.json({
      success: true,
      data: updatedTimeOff,
      message: 'Time off updated successfully'
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }

    console.error('Error updating time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to update time off'
    });
  }
});

// Delete time off
router.delete('/time-off/:id', async (req, res) => {
  try {
    const timeOffId = parseInt(req.params.id);
    await DoctorScheduleDAL.deleteTimeOff(timeOffId);

    return res.json({
      success: true,
      message: 'Time off deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete time off'
    });
  }
});

// Check if doctor is on time off for a specific date
router.get('/doctor/:doctorId/time-off/check', async (req, res) => {
  try {
    const doctorId = parseInt(req.params.doctorId);
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'date parameter is required'
      });
    }

    const checkDate = new Date(date as string);
    const isOnTimeOff = await DoctorScheduleDAL.isDoctorOnTimeOff(doctorId, checkDate);

    return res.json({
      success: true,
      data: { onTimeOff: isOnTimeOff }
    });
  } catch (error) {
    console.error('Error checking doctor time off:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to check doctor time off'
    });
  }
});

export default router;