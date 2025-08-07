import { Request, Response } from 'express';
import { z } from 'zod';
import { insertUserSchema } from '../../models/securitySchema';
import { UserDAL, RoleDAL } from '../../dal';
import { ResponseHelper } from '../../utils';
import { MESSAGES } from '../../constants/messages';
import { HTTP_STATUS } from '../../constants/statusCodes';

export class UserController {
  // Get all users
  static async getAllUsers(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const isSuperAdmin = currentUser.userType === 'SuperAdmin';

      // if (!isSuperAdmin) {
      //   return ResponseHelper.send(res, false, 'Access denied. Only SuperAdmin can view all users.', HTTP_STATUS.FORBIDDEN);
      // }

      const users = await UserDAL.getAllUsers();
      
      const formattedUsers = users.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        clinicId: user.clinicId,
        roleId: user.roleId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, formattedUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get users by type
  static async getUsersByType(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const isSuperAdmin = currentUser.userType === 'SuperAdmin';

      if (!isSuperAdmin) {
        return ResponseHelper.send(res, false, 'Access denied. Only SuperAdmin can view users by type.', HTTP_STATUS.FORBIDDEN);
      }

      const { userType } = req.params;
      const validUserTypes = ["SuperAdmin", "Clinic", "Doctor", "Patient", "Staff", "HawkLogix"];
      
      if (!validUserTypes.includes(userType)) {
        return ResponseHelper.send(res, false, 'Invalid user type', HTTP_STATUS.BAD_REQUEST);
      }

      const allUsers = await UserDAL.getAllUsers();
      const filteredUsers = allUsers.filter(user => user.userType === userType);
      
      const formattedUsers = filteredUsers.map(user => ({
        id: user.id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        status: user.status,
        clinicId: user.clinicId,
        roleId: user.roleId,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, formattedUsers);
    } catch (error) {
      console.error('Error fetching users by type:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get user by ID
  static async getUserById(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      const user = await UserDAL.findById(userId);
      if (!user) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, user);
    } catch (error) {
      console.error('Error fetching user:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Create new user
  static async createUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const isSuperAdmin = currentUser.userType === 'SuperAdmin';

      // if (!isSuperAdmin) {
      //   return ResponseHelper.send(res, false, 'Access denied. Only SuperAdmin can create users.', HTTP_STATUS.FORBIDDEN);
      // }

      // Validate input
      const validationResult = insertUserSchema.safeParse(req.body);
      if (!validationResult.success) {
        return ResponseHelper.send(res, false, MESSAGES.VALIDATION.INVALID_INPUT, HTTP_STATUS.VALIDATION_ERROR, undefined, validationResult.error.errors);
      }

      const userData = validationResult.data;

      // Check for existing email
      const existingUserByEmail = await UserDAL.findByEmail(userData.email);
      if (existingUserByEmail) {
        return ResponseHelper.send(res, false, 'Email address is already registered', HTTP_STATUS.CONFLICT);
      }

      // Check for existing username
      const existingUserByUsername = await UserDAL.findByUsername(userData.username);
      if (existingUserByUsername) {
        return ResponseHelper.send(res, false, 'Username is already taken', HTTP_STATUS.CONFLICT);
      }

      // Create user with hashed password
      const bcrypt = await import('bcrypt');
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(userData.passwordHash, saltRounds);
      
      const userCreateData = {
        username: userData.username,
        email: userData.email,
        passwordHash: hashedPassword, // Use the hashed password
        userType: userData.userType,
        firstName: userData.firstName,
        lastName: userData.lastName,
        phone: userData.phone,
        clinicId: userData.clinicId,
        roleId: userData.roleId,
      };

      const newUser = await UserDAL.create(userCreateData);

      // For SuperAdmin users, automatically assign the SuperAdmin role
      if (userData.userType === 'SuperAdmin') {
        try {
          const superAdminRole = await RoleDAL.findByName('SuperAdmin');
          if (superAdminRole) {
            await RoleDAL.assignRoleToUser(newUser.id, superAdminRole.id);
            console.log(`SuperAdmin role assigned to user ${newUser.id}`);
          } else {
            console.warn('SuperAdmin role not found, user created without role assignment');
          }
        } catch (error) {
          console.error('Error assigning SuperAdmin role:', error);
        }
      }

      const responseData = {
        id: newUser.id,
        username: newUser.username,
        email: newUser.email,
        userType: newUser.userType,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phone: newUser.phone,
        status: newUser.status,
        clinicId: newUser.clinicId,
        roleId: newUser.roleId,
        createdAt: newUser.createdAt,
      };

      return ResponseHelper.send(res, true, MESSAGES.CRUD.CREATE_SUCCESS, HTTP_STATUS.CREATED, responseData);
    } catch (error: any) {
      console.error('Error creating user:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.CREATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Update user
  static async updateUser(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user has permission to update this user
      const currentUser = (req as any).user;
      const isSuperAdmin = currentUser.userType === 'SuperAdmin' || (currentUser.permissions && currentUser.permissions.length >= 20);
      const isOwnProfile = currentUser.id === userId;

      if (!isSuperAdmin && !isOwnProfile) {
        return ResponseHelper.send(res, false, 'Access denied. You can only update your own profile.', HTTP_STATUS.FORBIDDEN);
      }

      // Check if user exists
      const existingUser = await UserDAL.findById(userId);
      if (!existingUser) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      const validatedData = req.body;
      const userUpdateData: any = {};

      // Build update data
      if (validatedData.username !== undefined) userUpdateData.username = validatedData.username;
      if (validatedData.email !== undefined) userUpdateData.email = validatedData.email;
      if (validatedData.firstName !== undefined) userUpdateData.firstName = validatedData.firstName;
      if (validatedData.lastName !== undefined) userUpdateData.lastName = validatedData.lastName;
      if (validatedData.phone !== undefined) userUpdateData.phone = validatedData.phone;
      
      // Only SuperAdmin can change status
      if (validatedData.status !== undefined && isSuperAdmin) {
        userUpdateData.status = validatedData.status;
      }

      // Handle password update
      if (validatedData.password && validatedData.password.trim() !== '') {
        const bcrypt = await import('bcrypt');
        const saltRounds = 12;
        userUpdateData.passwordHash = await bcrypt.hash(validatedData.password, saltRounds);
      }

      // Check for unique constraints
      if (userUpdateData.username && userUpdateData.username !== existingUser.username) {
        const existingUserByUsername = await UserDAL.findByUsername(userUpdateData.username);
        if (existingUserByUsername && existingUserByUsername.id !== userId) {
          return ResponseHelper.send(res, false, 'Username is already taken', HTTP_STATUS.CONFLICT);
        }
      }

      if (userUpdateData.email && userUpdateData.email !== existingUser.email) {
        const existingUserByEmail = await UserDAL.findByEmail(userUpdateData.email);
        if (existingUserByEmail && existingUserByEmail.id !== userId) {
          return ResponseHelper.send(res, false, 'Email address is already registered', HTTP_STATUS.CONFLICT);
        }
      }

      // Update user
      if (Object.keys(userUpdateData).length > 0) {
        await UserDAL.update(userId, userUpdateData);
      }

      // Fetch updated user
      const updatedUser = await UserDAL.findById(userId);

      const responseData = {
        id: updatedUser!.id,
        username: updatedUser!.username,
        email: updatedUser!.email,
        firstName: updatedUser!.firstName,
        lastName: updatedUser!.lastName,
        phone: updatedUser!.phone,
        status: updatedUser!.status,
        userType: updatedUser!.userType,
        clinicId: updatedUser!.clinicId,
      };

      return ResponseHelper.send(res, true, MESSAGES.CRUD.UPDATE_SUCCESS, HTTP_STATUS.OK, responseData);
    } catch (error: any) {
      console.error('Error updating user:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.UPDATE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Delete user
  static async deleteUser(req: Request, res: Response) {
    try {
      const currentUser = (req as any).user;
      const isSuperAdmin = currentUser.userType === 'SuperAdmin';

      if (!isSuperAdmin) {
        return ResponseHelper.send(res, false, 'Access denied. Only SuperAdmin can delete users.', HTTP_STATUS.FORBIDDEN);
      }

      const userId = parseInt(req.params.id);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }

      // Prevent self-deletion
      if (currentUser.id === userId) {
        return ResponseHelper.send(res, false, 'Cannot delete your own account', HTTP_STATUS.BAD_REQUEST);
      }

      // Check if user exists
      const existingUser = await UserDAL.findById(userId);
      if (!existingUser) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      await UserDAL.deleteUser(userId);

      return ResponseHelper.send(res, true, MESSAGES.CRUD.DELETE_SUCCESS, HTTP_STATUS.OK);
    } catch (error: any) {
      console.error('Error deleting user:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.DELETE_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }

  // Get user permissions
  static async getUserPermissions(req: Request, res: Response) {
    try {
      const userId = parseInt(req.params.userId);
      if (isNaN(userId)) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.INVALID_ID, HTTP_STATUS.BAD_REQUEST);
      }
      
      // Validate user exists
      const user = await UserDAL.findById(userId);
      if (!user) {
        return ResponseHelper.send(res, false, MESSAGES.CRUD.NOT_FOUND, HTTP_STATUS.NOT_FOUND);
      }

      // Get user permissions using DAL
      const permissions = await UserDAL.getUserPermissions(userId);
      
      return ResponseHelper.send(res, true, MESSAGES.CRUD.FETCH_SUCCESS, HTTP_STATUS.OK, permissions);
    } catch (error) {
      console.error('Error fetching user permissions:', error);
      return ResponseHelper.send(res, false, MESSAGES.CRUD.FETCH_ERROR, HTTP_STATUS.SERVER_ERROR);
    }
  }
} 