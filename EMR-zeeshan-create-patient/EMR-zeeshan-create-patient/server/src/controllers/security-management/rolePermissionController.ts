import { Request, Response } from 'express';
import { RolePermissionDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class RolePermissionController {
  // Get all role permissions
  static async getAllRolePermissions(req: Request, res: Response) {
    try {
      const rolePermissions = await RolePermissionDAL.getAllRolePermissions();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolePermissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch role permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get all role permissions with details
  static async getAllRolePermissionsWithDetails(req: Request, res: Response) {
    try {
      const rolePermissions = await RolePermissionDAL.getAllRolePermissionsWithDetails();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolePermissions);
    } catch (error) {
      console.error('Error fetching role permissions with details:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch role permissions with details', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get role permissions by role ID
  static async getRolePermissionsByRoleId(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const rolePermissions = await RolePermissionDAL.getRolePermissionsByRoleId(roleId);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolePermissions);
    } catch (error) {
      console.error('Error fetching role permissions by role ID:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch role permissions by role ID', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get role permissions with details by role ID
  static async getRolePermissionsWithDetails(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const rolePermissions = await RolePermissionDAL.getRolePermissionsWithDetails(roleId);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolePermissions);
    } catch (error) {
      console.error('Error fetching role permissions with details:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch role permissions with details', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get role permissions (module and operation names)
  static async getRolePermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      const permissions = await RolePermissionDAL.getRolePermissions(roleId);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, permissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch role permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Check if role has specific permission
  static async checkRolePermission(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { moduleName, operationName } = req.query;
      
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!moduleName || !operationName) {
        return ResponseHelper.send(res, false, 'Module name and operation name are required', HTTP_STATUS.BAD_REQUEST);
      }
      const hasPermission = await RolePermissionDAL.hasPermission(roleId, moduleName as string, operationName as string);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, { hasPermission });
    } catch (error) {
      console.error('Error checking role permission:', error);
      return ResponseHelper.send(res, false, 'Failed to check role permission', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Assign permissions to role
  static async assignPermissionsToRole(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { moduleOperationIds } = req.body;
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await RolePermissionDAL.assignPermissionsToRole(roleId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'Permissions assigned successfully', HTTP_STATUS.OK);
    } catch (error: any) {
      console.error('Error assigning permissions:', error);
      return ResponseHelper.send(res, false, error.message || 'Failed to assign permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update role permissions
  static async updateRolePermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { moduleOperationIds } = req.body;
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await RolePermissionDAL.updateRolePermissions(roleId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'Role permissions updated successfully', HTTP_STATUS.OK);
    } catch (error: any) {
      console.error('Error updating role permissions:', error);
      return ResponseHelper.send(res, false, error.message || 'Failed to update role permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Remove permissions from role
  static async removePermissionsFromRole(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      const { moduleOperationIds } = req.body;
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, 'moduleOperationIds must be an array', HTTP_STATUS.BAD_REQUEST);
      }
      await RolePermissionDAL.removePermissionsFromRole(roleId, moduleOperationIds);
      return ResponseHelper.send(res, true, 'Permissions removed successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error removing permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to remove permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete all permissions for a role
  static async deleteAllRolePermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.roleId);
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      await RolePermissionDAL.deleteAllRolePermissions(roleId);
      return ResponseHelper.send(res, true, 'All role permissions deleted successfully', HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting all role permissions:', error);
      return ResponseHelper.send(res, false, 'Failed to delete all role permissions', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get roles with permission counts
  static async getRolesWithPermissionCounts(req: Request, res: Response) {
    try {
      const rolesWithCounts = await RolePermissionDAL.getRolesWithPermissionCounts();
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolesWithCounts);
    } catch (error) {
      console.error('Error fetching roles with permission counts:', error);
      return ResponseHelper.send(res, false, 'Failed to fetch roles with permission counts', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create a single role permission
  static async createRolePermission(req: Request, res: Response) {
    try {
      const { roleId, moduleOperationId } = req.body;
      
      if (!roleId || !moduleOperationId) {
        return ResponseHelper.send(res, false, 'Role ID and module operation ID are required', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if role permission already exists
      const exists = await RolePermissionDAL.exists(roleId, moduleOperationId);
      if (exists) {
        return ResponseHelper.send(res, false, 'Role permission already exists', HTTP_STATUS.CONFLICT);
      }

      const rolePermission = await RolePermissionDAL.create({ roleId, moduleOperationId });
      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, rolePermission);
    } catch (error: any) {
      console.error('Error creating role permission:', error);
      return ResponseHelper.send(res, false, error.message || 'Failed to create role permission', HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete a single role permission
  static async deleteRolePermission(req: Request, res: Response) {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      await RolePermissionDAL.delete(id);
      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting role permission:', error);
      return ResponseHelper.send(res, false, 'Failed to delete role permission', HTTP_STATUS.SERVER_ERROR);
    }
  }
} 