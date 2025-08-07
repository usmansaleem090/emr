import { Request, Response } from 'express';
import { ModuleOperationDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class ModuleOperationController {
  // Get all modules and operations separately (for testing)
  static async getModulesAndOperations(req: Request, res: Response) {
    try {
      const result = await ModuleOperationDAL.getModulesAndOperations();
      
      console.log('All modules:', result.modules);
      console.log('All operations:', result.operations);
      
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, result);
    } catch (error) {
      console.error('Error fetching modules and operations:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch modules and operations', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get all module operations with related module and operation details
  static async getAllModuleOperations(req: Request, res: Response) {
    try {
      console.log('Fetching module operations...');
      const moduleOperations = await ModuleOperationDAL.getAllModuleOperationsWithDetails();

      console.log('Module operations result:', moduleOperations);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, moduleOperations);
    } catch (error) {
      console.error('Error fetching module operations:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch module operations', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 