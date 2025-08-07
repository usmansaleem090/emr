import { Request, Response } from 'express';
import { ClinicLocationScheduleDAL } from '../../dal/clinic-management/clinicLocationScheduleDAL';
import { ClinicLocationDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { insertClinicLocationScheduleSchema, updateClinicLocationScheduleSchema } from '../../models/clinicSchema';

export class ClinicLocationScheduleController {
  // Get all schedules for a clinic
  static async getSchedulesByClinic(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.error(res, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesWithLocationDetails(clinicIdNum);

      return ResponseHelper.success(res, 'Schedules retrieved successfully', schedules);
    } catch (error) {
      console.error('Error fetching clinic schedules:', error);
      return ResponseHelper.error(res, 'Failed to fetch clinic schedules');
    }
  }

  // Get all schedules for a specific location
  static async getSchedulesByLocation(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const locationIdNum = parseInt(locationId);

      if (isNaN(locationIdNum)) {
        return ResponseHelper.error(res, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesByLocationId(locationIdNum);

      return ResponseHelper.success(res, 'Location schedules retrieved successfully', schedules);
    } catch (error) {
      console.error('Error fetching location schedules:', error);
      return ResponseHelper.error(res, 'Failed to fetch location schedules');
    }
  }

  // Get current active schedule for a location
  static async getCurrentActiveSchedule(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const locationIdNum = parseInt(locationId);

      if (isNaN(locationIdNum)) {
        return ResponseHelper.error(res, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedule = await ClinicLocationScheduleDAL.getCurrentActiveSchedule(locationIdNum);

      if (!schedule) {
        return ResponseHelper.error(res, 'No active schedule found for this location', HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.success(res, 'Current active schedule retrieved successfully', schedule);
    } catch (error) {
      console.error('Error fetching current active schedule:', error);
      return ResponseHelper.error(res, 'Failed to fetch current active schedule');
    }
  }

  // Get schedule by ID
  static async getScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return ResponseHelper.error(res, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedule = await ClinicLocationScheduleDAL.getScheduleById(scheduleId);

      if (!schedule) {
        return ResponseHelper.error(res, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.success(res, 'Schedule retrieved successfully', schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return ResponseHelper.error(res, 'Failed to fetch schedule');
    }
  }

  // Create a new schedule
  static async createSchedule(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);
      const scheduleData = req.body;

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.error(res, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate schedule data
      const validationResult = insertClinicLocationScheduleSchema.safeParse({
        ...scheduleData,
        clinicId: clinicIdNum
      });

      if (!validationResult.success) {
        return ResponseHelper.error(res, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if location exists and belongs to the clinic
      const location = await ClinicLocationDAL.getLocationById(validationResult.data.locationId);
      if (!location || location.clinicId !== clinicIdNum) {
        return ResponseHelper.error(res, 'Invalid location for this clinic', HTTP_STATUS.BAD_REQUEST);
      }

      // If this schedule is set as active, deactivate other schedules for this location
      if (validationResult.data.isActive) {
        await ClinicLocationScheduleDAL.deactivateSchedulesForLocation(validationResult.data.locationId);
      }

      const newSchedule = await ClinicLocationScheduleDAL.createSchedule(validationResult.data);

      return ResponseHelper.success(res, 'Schedule created successfully', newSchedule, HTTP_STATUS.CREATED);
    } catch (error) {
      console.error('Error creating schedule:', error);
      return ResponseHelper.error(res, 'Failed to create schedule');
    }
  }

  // Update a schedule
  static async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);
      const updateData = req.body;

      if (isNaN(scheduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if schedule exists
      const existingSchedule = await ClinicLocationScheduleDAL.getScheduleById(scheduleId);
      if (!existingSchedule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Validate update data
      const validationResult = updateClinicLocationScheduleSchema.safeParse(updateData);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // If this schedule is being set as active, deactivate other schedules for this location
      if (validationResult.data.isActive) {
        await ClinicLocationScheduleDAL.deactivateSchedulesForLocation(existingSchedule.locationId);
      }

      const updatedSchedule = await ClinicLocationScheduleDAL.updateSchedule(scheduleId, validationResult.data);

      return ResponseHelper.send(res, true, 'Schedule updated successfully', HTTP_STATUS.OK, updatedSchedule);
    } catch (error) {
      console.error('Error updating schedule:', error);
      return ResponseHelper.send(res, false, 'Failed to update schedule', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete a schedule
  static async deleteSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if schedule exists
      const existingSchedule = await ClinicLocationScheduleDAL.getScheduleById(scheduleId);
      if (!existingSchedule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await ClinicLocationScheduleDAL.deleteSchedule(scheduleId);

      return ResponseHelper.send(res, true, 'Schedule deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting schedule:', error);
      return ResponseHelper.send(res, false, 'Failed to delete schedule', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get schedules for a date range
  static async getSchedulesByDateRange(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const { startDate, endDate } = req.query;
      const locationIdNum = parseInt(locationId);

      if (isNaN(locationIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      if (!startDate || !endDate) {
        return ResponseHelper.send(res, false, 'Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesByDateRange(
        locationIdNum,
        startDate as string,
        endDate as string
      );

      return ResponseHelper.send(res, true, 'Schedules for date range retrieved successfully', HTTP_STATUS.OK, schedules);
    } catch (error) {
      console.error('Error fetching schedules by date range:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch schedules for date range', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 