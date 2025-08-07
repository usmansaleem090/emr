import { Request, Response } from 'express';
import { z } from 'zod';
import { insertRoleSchema } from '../../models/securitySchema';
import { RoleDAL, RolePermissionDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class RoleController {
  // Get all roles with counts
  static async getAllRoles(req: Request, res: Response) {
    try {
      const roles = await RoleDAL.getAllRoles();
      const rolesWithCounts = await RoleDAL.getRolesWithCounts(roles);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, rolesWithCounts);
    } catch (error) {
      console.error('Error fetching roles:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get practice roles
  static async getPracticeRoles(req: Request, res: Response) {
    try {
      const roles = await RoleDAL.getPracticeRoles();
      
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, roles);
    } catch (error) {
      console.error('Error fetching practice roles:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get non-practice roles
  static async getNonPracticeRoles(req: Request, res: Response) {
    try {
      const roles = await RoleDAL.getNonPracticeRoles();
      
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, roles);
    } catch (error) {
      console.error('Error fetching non-practice roles:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get role by ID
  static async getRoleById(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      
      const role = await RoleDAL.findById(roleId);

      if (!role) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, role);
    } catch (error) {
      console.error('Error fetching role:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create new role
  static async createRole(req: Request, res: Response) {
    let validatedData: any;
    try {
      validatedData = insertRoleSchema.parse(req.body);
      
      // Check if role name already exists
      const existingRole = await RoleDAL.findByName(validatedData.name);
      if (existingRole) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      const newRole = await RoleDAL.create(validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, newRole);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      // Handle unique constraint violation
      if (error.code === '23505' && error.constraint === 'roles_name_key') {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
      }

      console.error('Error creating role:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update role
  static async updateRole(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      const validatedData = insertRoleSchema.partial().parse(req.body);

      // Check if role exists
      const existingRole = await RoleDAL.findById(roleId);
      if (!existingRole) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Check for name conflicts if name is being updated
      if (validatedData.name && validatedData.name !== existingRole.name) {
        const conflictRole = await RoleDAL.findByName(validatedData.name);
        if (conflictRole) {
          return ResponseHelper.send(res, false, MESSAGES.CRUD.ALREADY_EXISTS, HTTP_STATUS.CONFLICT);
        }
      }

      const updatedRole = await RoleDAL.update(roleId, validatedData);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, updatedRole);
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, error.errors);
      }

      console.error('Error updating role:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete role
  static async deleteRole(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);

      // Check if role exists
      const existingRole = await RoleDAL.findById(roleId);
      if (!existingRole) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // TODO: Add check for users assigned to this role
      // const usersWithRole = await UserDAL.getUsersByRoleId(roleId);
      // if (usersWithRole.length > 0) {
      //   return ResponseHelper.send(res, false, 'Cannot delete role with assigned users', HTTP_STATUS.BAD_REQUEST);
      // }

      await RoleDAL.delete(roleId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error deleting role:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get role permissions
  static async getRolePermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      
      if (isNaN(roleId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if role exists
      const role = await RoleDAL.findById(roleId);
      if (!role) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const permissions = await RolePermissionDAL.getRolePermissions(roleId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, permissions);
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update role permissions
  static async updateRolePermissions(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      const { moduleOperationIds } = req.body;

      // Validate input
      if (!Array.isArray(moduleOperationIds)) {
        return ResponseHelper.send(res, false, MESSAGES.ROLE.INVALID_MODULE_OPERATION_IDS, HTTP_STATUS.BAD_REQUEST);
      }

      // Filter out null/undefined values and ensure all are numbers
      const validIds = moduleOperationIds.filter(id => id != null && typeof id === 'number' && !isNaN(id));

      // Check if role exists
      const role = await RoleDAL.findById(roleId);
      if (!role) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await RolePermissionDAL.updateRolePermissions(roleId, validIds);

      return ResponseHelper.send(res, true, MESSAGES.ROLE.PERMISSIONS_UPDATED, HTTP_STATUS.OK);
    } catch (error) {
      console.error('Error updating role permissions:', error);
      return ResponseHelper.send(res, false, MESSAGES.ROLE.PERMISSIONS_UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }
} 