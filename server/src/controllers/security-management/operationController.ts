import { Request, Response } from 'express';
import { z } from 'zod';
import { insertOperationSchema } from '../../models/securitySchema';
import { OperationDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class OperationController {
  // Get all operations
  static async getAllOperations(req: Request, res: Response) {
    try {
      const operations = await OperationDAL.getAllOperations();

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, operations);
    } catch (error) {
      console.error('Error fetching operations:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get operation by ID
  static async getOperationById(req: Request, res: Response) {
    try {
      const operationId = parseInt(req.params.id);
      
      if (isNaN(operationId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const operation = await OperationDAL.findById(operationId);
      if (!operation) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, operation);
    } catch (error) {
      console.error('Error fetching operation:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create new operation
  static async createOperation(req: Request, res: Response) {
    let validatedData: any;
    try {
      validatedData = insertOperationSchema.parse(req.body);
      
      // Check if operation name already exists
      const existingOperation = await OperationDAL.findByName(validatedData.name);
      if (existingOperation) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      const newOperation = await OperationDAL.create(validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, newOperation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      // Handle unique constraint violation
      if (error.code === '23505' && error.constraint === 'operations_name_key') {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      console.error('Error creating operation:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update operation
  static async updateOperation(req: Request, res: Response) {
    try {
      const operationId = parseInt(req.params.id);
      const validatedData = insertOperationSchema.partial().parse(req.body);

      // Check if operation exists
      const existingOperation = await OperationDAL.findById(operationId);
      if (!existingOperation) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Check for name conflicts if name is being updated
      if (validatedData.name && validatedData.name !== existingOperation.name) {
        const conflictOperation = await OperationDAL.findByName(validatedData.name);
        if (conflictOperation) {
          return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
      }

      const updatedOperation = await OperationDAL.update(operationId, validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, updatedOperation);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      console.error('Error updating operation:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete operation
  static async deleteOperation(req: Request, res: Response) {
    try {
      const operationId = parseInt(req.params.id);

      // Check if operation exists
      const existingOperation = await OperationDAL.findById(operationId);
      if (!existingOperation) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // TODO: Add check for modules using this operation
      // const modulesWithOperation = await ModuleOperationDAL.getModulesByOperationId(operationId);
      // if (modulesWithOperation.length > 0) {
      //   return ResponseHelper.send(res, false, 'Cannot delete operation that is assigned to modules', HTTP_STATUS.BAD_REQUEST);
      // }

      await OperationDAL.delete(operationId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting operation:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }
} 