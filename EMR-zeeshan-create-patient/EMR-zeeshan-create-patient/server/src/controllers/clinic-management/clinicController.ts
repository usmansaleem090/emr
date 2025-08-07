import { Request, Response } from 'express';
import { ClinicDAL, ClinicSettingsDAL, SpecialtyDAL, InsuranceDAL, ClinicLocationDAL, LocationServiceDAL } from '../../dal';
import { ClinicLocationScheduleDAL } from '../../dal/clinic-management/clinicLocationScheduleDAL';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';
import { insertClinicSchema, updateClinicSchema, insertClinicSettingsSchema, updateClinicSettingsSchema, updateClinicLocationScheduleSchema } from '../../models/clinicSchema';

export class ClinicController {
  // ===== CLINIC CRUD OPERATIONS =====

  // Get all clinics
  static async getAllClinics(req: Request, res: Response) {
    try {
      const clinics = await ClinicDAL.getAllClinics();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, clinics);
    } catch (error) {
      console.error('Error fetching clinics:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get clinic by ID
  static async getClinicById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clinicId = parseInt(id);

      if (isNaN(clinicId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const clinic = await ClinicDAL.getClinicById(clinicId);
      if (!clinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, clinic);
    } catch (error) {
      console.error('Error fetching clinic:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create new clinic
  static async createClinic(req: Request, res: Response) {
    try {
      const clinicData = req.body;
      
      // Validate clinic data
      const validationResult = insertClinicSchema.safeParse(clinicData);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic with same name already exists
      const existingClinic = await ClinicDAL.findByName(clinicData.name);
      if (existingClinic) {
        return ResponseHelper.send(res, false, 'Clinic with this name already exists', HTTP_STATUS.CONFLICT);
      }

      const newClinic = await ClinicDAL.createClinic(validationResult.data);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, newClinic);
    } catch (error) {
      console.error('Error creating clinic:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic
  static async updateClinic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clinicId = parseInt(id);
      const updateData = req.body;

      if (isNaN(clinicId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate update data
      const validationResult = updateClinicSchema.safeParse(updateData);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicId);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateData.name && updateData.name !== existingClinic.name) {
        const duplicateClinic = await ClinicDAL.findByName(updateData.name);
        if (duplicateClinic) {
          return ResponseHelper.send(res, false, 'Clinic with this name already exists', HTTP_STATUS.CONFLICT);
        }
      }

      const updatedClinic = await ClinicDAL.update(clinicId, validationResult.data);
      if (!updatedClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, updatedClinic);
    } catch (error) {
      console.error('Error updating clinic:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic
  static async deleteClinic(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const clinicId = parseInt(id);

      if (isNaN(clinicId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicId);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const deleted = await ClinicDAL.deleteClinic(clinicId);
      if (!deleted) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC SETTINGS OPERATIONS =====

  // Get clinic settings
  static async getClinicSettings(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      const settings = await ClinicSettingsDAL.findByClinicId(id);
      if (!settings) {
        return ResponseHelper.send(res, false, 'Clinic settings not found', HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, settings);
    } catch (error) {
      console.error('Error fetching clinic settings:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create clinic settings
  static async createClinicSettings(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);
      const settingsData = req.body;

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate settings data
      const validationResult = insertClinicSettingsSchema.safeParse(settingsData);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if settings already exist for this clinic
      const existingSettings = await ClinicSettingsDAL.findByClinicId(id);
      if (existingSettings) {
        return ResponseHelper.send(res, false, 'Clinic settings already exist for this clinic', HTTP_STATUS.CONFLICT);
      }

      const newSettings = await ClinicSettingsDAL.createSettings({
        ...validationResult.data,
        clinicId: id
      });

      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, newSettings);
    } catch (error) {
      console.error('Error creating clinic settings:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic settings
  static async updateClinicSettings(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);
      const updateData = req.body;

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Validate update data
      const validationResult = updateClinicSettingsSchema.safeParse(updateData);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if settings exist
      const existingSettings = await ClinicSettingsDAL.findByClinicId(id);
      
      let result;
      if (!existingSettings) {
        // Create new settings if they don't exist
        const createData = {
          ...validationResult.data,
          clinicId: id
        };
        result = await ClinicSettingsDAL.createSettings(createData);
        if (!result) {
          return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
        }
        return ResponseHelper.send(res, true, 'Clinic settings created successfully', HTTP_STATUS.CREATED, result);
      } else {
        // Update existing settings
        result = await ClinicSettingsDAL.updateSettings(id, validationResult.data);
        if (!result) {
          return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
        }
        return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, result);
      }
    } catch (error) {
      console.error('Error updating clinic settings:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic settings
  static async deleteClinicSettings(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if settings exist
      const existingSettings = await ClinicSettingsDAL.findByClinicId(id);
      if (!existingSettings) {
        return ResponseHelper.send(res, false, 'Clinic settings not found', HTTP_STATUS.NOT_FOUND);
      }

      const deleted = await ClinicSettingsDAL.deleteSettings(id);
      if (!deleted) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic settings:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC SPECIALTIES OPERATIONS =====

  // Get all available specialties
  static async getAllSpecialties(req: Request, res: Response) {
    try {
      const specialties = await SpecialtyDAL.getAllMedicalSpecialties();
      return ResponseHelper.send(res, true, 'Specialties fetched successfully', HTTP_STATUS.OK, specialties);
    } catch (error) {
      console.error('Error fetching specialties:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch specialties', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get clinic specialties
  static async getClinicSpecialties(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const specialties = await SpecialtyDAL.getClinicSpecialtiesWithDetails(id);
      return ResponseHelper.send(res, true, 'Clinic specialties fetched successfully', HTTP_STATUS.OK, specialties);
    } catch (error) {
      console.error('Error fetching clinic specialties:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch clinic specialties', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Save clinic specialties
  static async saveClinicSpecialties(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { specialties } = req.body;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Validate specialties array
      if (!Array.isArray(specialties)) {
        return ResponseHelper.send(res, false, 'Specialties must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      // Convert specialty names to IDs
      const specialtyIds: number[] = [];
      for (const specialtyName of specialties) {
        const specialty = await SpecialtyDAL.getMedicalSpecialtyByName(specialtyName);
        if (specialty) {
          specialtyIds.push(specialty.id);
        }
      }

      // Bulk update clinic specialties
      await SpecialtyDAL.bulkUpdateClinicSpecialties(id, specialtyIds);

      return ResponseHelper.send(res, true, 'Clinic specialties saved successfully', HTTP_STATUS.OK, { clinicId: id, specialties });
    } catch (error) {
      console.error('Error saving clinic specialties:', error);
      return ResponseHelper.send(res, false, 'Failed to save clinic specialties', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic specialties
  static async updateClinicSpecialties(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { specialties } = req.body;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Validate specialties array
      if (!Array.isArray(specialties)) {
        return ResponseHelper.send(res, false, 'Specialties must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      // Convert specialty names to IDs
      const specialtyIds: number[] = [];
      for (const specialtyName of specialties) {
        const specialty = await SpecialtyDAL.getMedicalSpecialtyByName(specialtyName);
        if (specialty) {
          specialtyIds.push(specialty.id);
        }
      }

      // Bulk update clinic specialties
      await SpecialtyDAL.bulkUpdateClinicSpecialties(id, specialtyIds);

      return ResponseHelper.send(res, true, 'Clinic specialties updated successfully', HTTP_STATUS.OK, { clinicId: id, specialties });
    } catch (error) {
      console.error('Error updating clinic specialties:', error);
      return ResponseHelper.send(res, false, 'Failed to update clinic specialties', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic specialties
  static async deleteClinicSpecialties(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Delete all specialties for this clinic
      await SpecialtyDAL.bulkUpdateClinicSpecialties(id, []);

      return ResponseHelper.send(res, true, 'Clinic specialties deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic specialties:', error);
      return ResponseHelper.send(res, false, 'Failed to delete clinic specialties', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC INSURANCES OPERATIONS =====

  // Get all available insurance providers
  static async getAllInsuranceProviders(req: Request, res: Response) {
    try {
      const providers = await InsuranceDAL.getAllInsuranceProviders();
      return ResponseHelper.send(res, true, 'Insurance providers fetched successfully', HTTP_STATUS.OK, providers);
    } catch (error) {
      console.error('Error fetching insurance providers:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch insurance providers', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get clinic insurances
  static async getClinicInsurances(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const insurances = await InsuranceDAL.getClinicInsurancesWithDetails(id);
      return ResponseHelper.send(res, true, 'Clinic insurances fetched successfully', HTTP_STATUS.OK, insurances);
    } catch (error) {
      console.error('Error fetching clinic insurances:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch clinic insurances', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Save clinic insurances
  static async saveClinicInsurances(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { insurances } = req.body;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Validate insurances array
      if (!Array.isArray(insurances)) {
        return ResponseHelper.send(res, false, 'Insurances must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      // Convert insurance names to IDs
      const insuranceIds: number[] = [];
      for (const insuranceName of insurances) {
        const insurance = await InsuranceDAL.getInsuranceProviderByName(insuranceName);
        if (insurance) {
          insuranceIds.push(insurance.id);
        }
      }

      // Bulk update clinic insurances
      await InsuranceDAL.bulkUpdateClinicInsurances(id, insuranceIds);

      return ResponseHelper.send(res, true, 'Clinic insurances saved successfully', HTTP_STATUS.OK, { clinicId: id, insurances });
    } catch (error) {
      console.error('Error saving clinic insurances:', error);
      return ResponseHelper.send(res, false, 'Failed to save clinic insurances', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic insurances
  static async updateClinicInsurances(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { insurances } = req.body;
      const id = parseInt(clinicId);

      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(id);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Validate insurances array
      if (!Array.isArray(insurances)) {
        return ResponseHelper.send(res, false, 'Insurances must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      // Convert insurance names to IDs
      const insuranceIds: number[] = [];
      for (const insuranceName of insurances) {
        const insurance = await InsuranceDAL.getInsuranceProviderByName(insuranceName);
        if (insurance) {
          insuranceIds.push(insurance.id);
        }
      }

      // Bulk update clinic insurances
      await InsuranceDAL.bulkUpdateClinicInsurances(id, insuranceIds);

      return ResponseHelper.send(res, true, 'Clinic insurances updated successfully', HTTP_STATUS.OK, { clinicId: id, insurances });
    } catch (error) {
      console.error('Error updating clinic insurances:', error);
      return ResponseHelper.send(res, false, 'Failed to update clinic insurances', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic insurances
  static async deleteClinicInsurances(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await InsuranceDAL.bulkUpdateClinicInsurances(clinicIdNum, []);
      return ResponseHelper.send(res, true, 'Clinic insurances deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic insurances:', error);
      return ResponseHelper.send(res, false, 'Failed to delete clinic insurances', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC LOCATIONS OPERATIONS =====

  // Get clinic locations
  static async getClinicLocations(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const locations = await ClinicLocationDAL.getLocationsByClinicId(clinicIdNum);
      return ResponseHelper.send(res, true, 'Clinic locations fetched successfully', HTTP_STATUS.OK, locations);
    } catch (error) {
      console.error('Error fetching clinic locations:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch clinic locations', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Save clinic locations
  static async saveClinicLocations(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { locations } = req.body;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Delete existing locations and create new ones
      const existingLocations = await ClinicLocationDAL.getLocationsByClinicId(clinicIdNum);
      for (const location of existingLocations) {
        await ClinicLocationDAL.deleteLocation(location.id);
      }

      // Create new locations
      const createdLocations = [];
      for (const locationData of locations) {
        const location = await ClinicLocationDAL.createLocation({
          clinicId: clinicIdNum,
          name: locationData.name,
          address: locationData.address,
          hours: locationData.hours,
          services: locationData.services || [],
          providers: locationData.providers || []
        });
        createdLocations.push(location);
      }

      return ResponseHelper.send(res, true, 'Clinic locations saved successfully', HTTP_STATUS.OK, createdLocations);
    } catch (error) {
      console.error('Error saving clinic locations:', error);
      return ResponseHelper.send(res, false, 'Failed to save clinic locations', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic locations
  static async updateClinicLocations(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { locations } = req.body;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Delete existing locations and create new ones
      const existingLocations = await ClinicLocationDAL.getLocationsByClinicId(clinicIdNum);
      for (const location of existingLocations) {
        await ClinicLocationDAL.deleteLocation(location.id);
      }

      // Create new locations
      const createdLocations = [];
      for (const locationData of locations) {
        const location = await ClinicLocationDAL.createLocation({
          clinicId: clinicIdNum,
          name: locationData.name,
          address: locationData.address,
          hours: locationData.hours,
          services: locationData.services || [],
          providers: locationData.providers || []
        });
        createdLocations.push(location);
      }

      return ResponseHelper.send(res, true, 'Clinic locations updated successfully', HTTP_STATUS.OK, createdLocations);
    } catch (error) {
      console.error('Error updating clinic locations:', error);
      return ResponseHelper.send(res, false, 'Failed to update clinic locations', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic locations
  static async deleteClinicLocations(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const existingLocations = await ClinicLocationDAL.getLocationsByClinicId(clinicIdNum);
      for (const location of existingLocations) {
        await ClinicLocationDAL.deleteLocation(location.id);
      }

      return ResponseHelper.send(res, true, 'Clinic locations deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic locations:', error);
      return ResponseHelper.send(res, false, 'Failed to delete clinic locations', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC LOCATION SERVICES OPERATIONS =====

  // Get clinic location services
  static async getClinicLocationServices(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const locationServices = await LocationServiceDAL.getLocationServicesWithDetails(clinicIdNum);
      return ResponseHelper.send(res, true, 'Clinic location services fetched successfully', HTTP_STATUS.OK, locationServices);
    } catch (error) {
      console.error('Error fetching clinic location services:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch clinic location services', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Save clinic location services
  static async saveClinicLocationServices(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { locationServices } = req.body;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await LocationServiceDAL.bulkUpdateLocationServices(clinicIdNum, locationServices);
      return ResponseHelper.send(res, true, 'Clinic location services saved successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error saving clinic location services:', error);
      return ResponseHelper.send(res, false, 'Failed to save clinic location services', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update clinic location services
  static async updateClinicLocationServices(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const { locationServices } = req.body;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await LocationServiceDAL.bulkUpdateLocationServices(clinicIdNum, locationServices);
      return ResponseHelper.send(res, true, 'Clinic location services updated successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error updating clinic location services:', error);
      return ResponseHelper.send(res, false, 'Failed to update clinic location services', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete clinic location services
  static async deleteClinicLocationServices(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if clinic exists
      const existingClinic = await ClinicDAL.getClinicById(clinicIdNum);
      if (!existingClinic) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const existingServices = await LocationServiceDAL.getLocationServicesByClinicId(clinicIdNum);
      for (const service of existingServices) {
        await LocationServiceDAL.deleteLocationService(service.id);
      }

      return ResponseHelper.send(res, true, 'Clinic location services deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting clinic location services:', error);
      return ResponseHelper.send(res, false, 'Failed to delete clinic location services', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // ===== CLINIC LOCATION SCHEDULES =====

  // Get all schedules for a clinic
  static async getSchedulesByClinic(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesWithLocationDetails(clinicIdNum);
      return ResponseHelper.send(res, true, 'Schedules retrieved successfully', HTTP_STATUS.OK, schedules);
    } catch (error) {
      console.error('Error fetching clinic schedules:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch clinic schedules', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get all schedules for a specific location
  static async getSchedulesByLocation(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const locationIdNum = parseInt(locationId);

      if (isNaN(locationIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesByLocationId(locationIdNum);
      return ResponseHelper.send(res, true, 'Location schedules retrieved successfully', HTTP_STATUS.OK, schedules);
    } catch (error) {
      console.error('Error fetching location schedules:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch location schedules', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get current active schedule for a location
  static async getCurrentActiveSchedule(req: Request, res: Response) {
    try {
      const { locationId } = req.params;
      const locationIdNum = parseInt(locationId);

      if (isNaN(locationIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedule = await ClinicLocationScheduleDAL.getCurrentActiveSchedule(locationIdNum);

      if (!schedule) {
        return ResponseHelper.send(res, false, 'No active schedule found for this location', HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, 'Current active schedule retrieved successfully', HTTP_STATUS.OK, schedule);
    } catch (error) {
      console.error('Error fetching current active schedule:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch current active schedule', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get schedule by ID
  static async getScheduleById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const schedule = await ClinicLocationScheduleDAL.getScheduleById(scheduleId);

      if (!schedule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, 'Schedule retrieved successfully', HTTP_STATUS.OK, schedule);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch schedule', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create a new schedule
  static async createSchedule(req: Request, res: Response) {
    try {
      const { clinicId } = req.params;
      const clinicIdNum = parseInt(clinicId);

      if (isNaN(clinicIdNum)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const scheduleData = req.body;

      // Verify that the location belongs to the clinic
      const location = await ClinicLocationDAL.getLocationById(scheduleData.locationId);
      if (!location || location.clinicId !== clinicIdNum) {
        return ResponseHelper.send(res, false, 'Location does not belong to this clinic', HTTP_STATUS.BAD_REQUEST);
      }

      // If this is an active schedule, deactivate other schedules for this location
      if (scheduleData.isActive) {
        await ClinicLocationScheduleDAL.deactivateSchedulesForLocation(scheduleData.locationId);
      }

      const schedule = await ClinicLocationScheduleDAL.createSchedule({
        ...scheduleData,
        clinicId: clinicIdNum
      });

      return ResponseHelper.send(res, true, 'Schedule created successfully', HTTP_STATUS.CREATED, schedule);
    } catch (error) {
      console.error('Error creating schedule:', error);
      return ResponseHelper.send(res, false, 'Failed to create schedule', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update a schedule
  static async updateSchedule(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const scheduleId = parseInt(id);

      if (isNaN(scheduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const updateData = req.body;

      // Validate update data
      const validationResult = updateClinicLocationScheduleSchema.safeParse(updateData);
      if (!validationResult.success) {
        console.error('Validation error:', validationResult.error);
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if schedule exists
      const existingSchedule = await ClinicLocationScheduleDAL.getScheduleById(scheduleId);
      if (!existingSchedule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // If this is being set as active, deactivate other schedules for this location
      if (updateData.isActive === true) {
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

      const deletedSchedule = await ClinicLocationScheduleDAL.deleteSchedule(scheduleId);

      if (!deletedSchedule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

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

      if (!startDate || !endDate || typeof startDate !== 'string' || typeof endDate !== 'string') {
        return ResponseHelper.send(res, false, 'Start date and end date are required', HTTP_STATUS.BAD_REQUEST);
      }

      const schedules = await ClinicLocationScheduleDAL.getSchedulesByDateRange(locationIdNum, startDate, endDate);

      return ResponseHelper.send(res, true, 'Schedules retrieved successfully', HTTP_STATUS.OK, schedules);
    } catch (error) {
      console.error('Error fetching schedules by date range:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch schedules by date range', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 