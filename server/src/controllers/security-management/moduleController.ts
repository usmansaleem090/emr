import { Request, Response } from 'express';
import { z } from 'zod';
import { insertModuleSchema } from '../../models/securitySchema';
import { ModuleDAL, ModuleOperationDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class ModuleController {
  // Get all modules with their operations
  static async getAllModules(req: Request, res: Response) {
    try {
      const modules = await ModuleDAL.getAllModules();
      
      // For each module, get its operations
      const modulesWithOperations = await Promise.all(
        modules.map(async (module) => {
          const operations = await ModuleOperationDAL.getModuleOperations(module.id);
          return {
            ...module,
            operations: operations
          };
        })
      );

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, modulesWithOperations);
    } catch (error) {
      console.error('Error fetching modules:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get module by ID
  static async getModuleById(req: Request, res: Response) {
    try {
      const moduleId = parseInt(req.params.id);
      
      if (isNaN(moduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const module = await ModuleDAL.findById(moduleId);
      if (!module) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, module);
    } catch (error) {
      console.error('Error fetching module:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create new module
  static async createModule(req: Request, res: Response) {
    let validatedData: any;
    try {
      validatedData = insertModuleSchema.parse(req.body);
      
      // Check if module name already exists
      const existingModule = await ModuleDAL.findByName(validatedData.name);
      if (existingModule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      const newModule = await ModuleDAL.create(validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, newModule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      // Handle unique constraint violation
      if (error.code === '23505' && error.constraint === 'modules_name_key') {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      console.error('Error creating module:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update module
  static async updateModule(req: Request, res: Response) {
    try {
      const moduleId = parseInt(req.params.id);
      const validatedData = insertModuleSchema.partial().parse(req.body);

      // Check if module exists
      const existingModule = await ModuleDAL.findById(moduleId);
      if (!existingModule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Check for name conflicts if name is being updated
      if (validatedData.name && validatedData.name !== existingModule.name) {
        const conflictModule = await ModuleDAL.findByName(validatedData.name);
        if (conflictModule) {
          return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
      }

      const updatedModule = await ModuleDAL.update(moduleId, validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, updatedModule);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      console.error('Error updating module:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete module
  static async deleteModule(req: Request, res: Response) {
    try {
      const moduleId = parseInt(req.params.id);

      // Check if module exists
      const existingModule = await ModuleDAL.findById(moduleId);
      if (!existingModule) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // TODO: Add check for operations assigned to this module
      // const operationsWithModule = await ModuleOperationDAL.getModuleOperations(moduleId);
      // if (operationsWithModule.length > 0) {
      //   return ResponseHelper.send(res, false, 'Cannot delete module with assigned operations', HTTP_STATUS.BAD_REQUEST);
      // }

      await ModuleDAL.delete(moduleId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting module:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get module operations
  static async getModuleOperations(req: Request, res: Response) {
    try {
      const moduleId = parseInt(req.params.id);
      
      if (isNaN(moduleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if module exists
      const module = await ModuleDAL.findById(moduleId);
      if (!module) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const operations = await ModuleOperationDAL.getModuleOperations(moduleId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, operations);
    } catch (error) {
      console.error('Error fetching module operations:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Assign operations to module
  static async assignOperationsToModule(req: Request, res: Response) {
    try {
      const moduleId = parseInt(req.params.id);
      const { operationIds } = req.body;

      // Validate input
      if (!Array.isArray(operationIds)) {
        return ResponseHelper.send(res, false, 'operationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }

      // Filter out null/undefined values and ensure all are numbers
      const validIds = operationIds.filter(id => id != null && typeof id === 'number' && !isNaN(id));

      // Check if module exists
      const module = await ModuleDAL.findById(moduleId);
      if (!module) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await ModuleOperationDAL.assignOperationsToModule(moduleId, validIds);

      return ResponseHelper.send(res, true, 'Operations assigned to module successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error assigning operations to module:', error);
      return ResponseHelper.send(res, false, 'Failed to assign operations to module', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 