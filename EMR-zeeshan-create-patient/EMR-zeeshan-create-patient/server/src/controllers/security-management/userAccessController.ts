import { Request, Response } from 'express';
import { UserAccessDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class UserAccessController {
  // Get all user access records
  static async getAllUserAccess(req: Request, res: Response) {
    try {
      const userAccess = await UserAccessDAL.getAllUserAccess();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, userAccess);
    } catch (error) {
      console.error('Error fetching user access:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch user access', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get all users (for testing)
  static async getAllUsers(req: Request, res: Response) {
    try {
      const { db } = await import('../../db');
      const { users } = await import('../models/User/userSchema');
      const allUsers = await db.select().from(users);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, allUsers);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch all users', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get users with permission counts
  static async getUsersWithPermissionCounts(req: Request, res: Response) {
    try {
      const usersWithCounts = await UserAccessDAL.getUsersWithPermissionCounts();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, usersWithCounts);
    } catch (error) {
      console.error('Error fetching users with permission counts:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch users with permission counts', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get user access by user ID
  static async getUserAccessByUserId(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const userAccess = await UserAccessDAL.getUserAccessWithDetails(userId);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, userAccess);
    } catch (error) {
      console.error('Error fetching user access:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch user access', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get user permissions
  static async getUserPermissions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const permissions = await UserAccessDAL.getUserPermissions(userId);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, permissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch user permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Check if user has specific permission
  static async checkUserPermission(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { moduleName, operationName } = req.query;
      
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!moduleName || !operationName) {
        return ResponseHelper.send(res, false, 'Module name and operation name are required', HTTP_STATUS.BAD_REQUEST);
      }
      const hasPermission = await UserAccessDAL.hasPermission(userId, moduleName as string, operationName as string);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, { hasPermission });
    } catch (error) {
      console.error('Error checking user permission:', error);
      return ResponseHelper.send(res, false, 'Failed to check user permission', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Assign permissions to user
  static async assignPermissionsToUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { moduleOperationIds } = req.body;
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await UserAccessDAL.assignPermissionsToUser(userId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'Permissions assigned successfully', HTTP_STATUS.OK);
    } catch (error: any) {
      console.error('Error assigning permissions:', error);
      return ResponseHelper.send(res, false, error.message || 'Failed to assign permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update user permissions
  static async updateUserPermissions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { moduleOperationIds } = req.body;
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await UserAccessDAL.updateUserPermissions(userId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'User permissions updated successfully', HTTP_STATUS.OK);
    } catch (error: any) {
      console.error('Error updating user permissions:', error);
      return ResponseHelper.send(res, false, error.message || 'Failed to update user permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Remove permissions from user
  static async removePermissionsFromUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      const { moduleOperationIds } = req.body;
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await UserAccessDAL.removePermissionsFromUser(userId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'Permissions removed successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error removing permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to remove permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete all permissions for a user
  static async deleteAllUserPermissions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      await UserAccessDAL.deleteAllUserPermissions(userId);
      return ResponseHelper.send(res, true, 'All user permissions deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting all user permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to delete all user permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 