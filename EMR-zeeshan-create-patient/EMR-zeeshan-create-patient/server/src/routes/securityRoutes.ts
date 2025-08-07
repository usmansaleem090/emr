import { Router } from 'express';
import { authMiddleware as authenticateToken } from '../middleware/authMiddleware';
import { 
  login, 
  logout, 
  verifyToken, 
  forgotPassword, 
  resetPassword, 
  seedData 
} from '../controllers/security-management/authController';
import { 
  UserController,
  RoleController,
  ModuleController,
  OperationController,
  ModuleOperationController,
  RolePermissionController,
  UserAccessController
} from '../controllers/security-management';

const router = Router();

// ============================================================================
// AUTHENTICATION ROUTES
// ============================================================================

// Authentication endpoints
router.post('/auth/login', login);
router.post('/auth/logout', authenticateToken, logout);
router.post('/auth/verify-token', authenticateToken, verifyToken);
router.post('/auth/forgot-password', forgotPassword);
router.post('/auth/reset-password', resetPassword);
router.post('/auth/seed-data', seedData);

// ============================================================================
// USER ROUTES
// ============================================================================

// User management endpoints
router.get('/users', authenticateToken, UserController.getAllUsers);
router.get('/users/by-type/:userType', authenticateToken, UserController.getUsersByType);
router.get('/users/:id', authenticateToken, UserController.getUserById);
router.post('/users', authenticateToken, UserController.createUser);
router.put('/users/:id', authenticateToken, UserController.updateUser);
router.delete('/users/:id', authenticateToken, UserController.deleteUser);
router.get('/users/:userId/permissions', authenticateToken, UserController.getUserPermissions);

// ============================================================================
// ROLE ROUTES
// ============================================================================

// Role management endpoints
router.get('/roles', authenticateToken, RoleController.getAllRoles);
router.get('/roles/practice', authenticateToken, RoleController.getPracticeRoles);
router.get('/roles/non-practice', authenticateToken, RoleController.getNonPracticeRoles);
router.get('/roles/:id', authenticateToken, RoleController.getRoleById);
router.post('/roles', authenticateToken, RoleController.createRole);
router.put('/roles/:id', authenticateToken, RoleController.updateRole);
router.delete('/roles/:id', authenticateToken, RoleController.deleteRole);
router.get('/roles/:id/permissions', authenticateToken, RoleController.getRolePermissions);
router.put('/roles/:id/permissions', authenticateToken, RoleController.updateRolePermissions);

// ============================================================================
// MODULE ROUTES
// ============================================================================

// Module management endpoints
router.get('/modules', authenticateToken, ModuleController.getAllModules);
router.get('/modules/:id', authenticateToken, ModuleController.getModuleById);
router.post('/modules', authenticateToken, ModuleController.createModule);
router.put('/modules/:id', authenticateToken, ModuleController.updateModule);
router.delete('/modules/:id', authenticateToken, ModuleController.deleteModule);

// ============================================================================
// OPERATION ROUTES
// ============================================================================

// Operation management endpoints
router.get('/operations', authenticateToken, OperationController.getAllOperations);
router.get('/operations/:id', authenticateToken, OperationController.getOperationById);
router.post('/operations', authenticateToken, OperationController.createOperation);
router.put('/operations/:id', authenticateToken, OperationController.updateOperation);
router.delete('/operations/:id', authenticateToken, OperationController.deleteOperation);

// ============================================================================
// MODULE OPERATION ROUTES
// ============================================================================

// Module operation management endpoints
router.get('/module-operations', authenticateToken, ModuleOperationController.getAllModuleOperations);
router.get('/module-operations/modules-and-operations', authenticateToken, ModuleOperationController.getModulesAndOperations);

// ============================================================================
// ROLE PERMISSION ROUTES
// ============================================================================

// Role permission management endpoints
router.get('/role-permissions', authenticateToken, RolePermissionController.getAllRolePermissions);
router.get('/role-permissions/with-details', authenticateToken, RolePermissionController.getAllRolePermissionsWithDetails);
router.get('/role-permissions/roles-with-counts', authenticateToken, RolePermissionController.getRolesWithPermissionCounts);
router.get('/role-permissions/role/:roleId', authenticateToken, RolePermissionController.getRolePermissionsByRoleId);
router.get('/role-permissions/role/:roleId/with-details', authenticateToken, RolePermissionController.getRolePermissionsWithDetails);
router.get('/role-permissions/role/:roleId/permissions', authenticateToken, RolePermissionController.getRolePermissions);
router.get('/role-permissions/role/:roleId/has-permission', authenticateToken, RolePermissionController.checkRolePermission);
router.post('/role-permissions/role/:roleId/permissions', authenticateToken, RolePermissionController.assignPermissionsToRole);
router.put('/role-permissions/role/:roleId/permissions', authenticateToken, RolePermissionController.updateRolePermissions);
router.delete('/role-permissions/role/:roleId/permissions', authenticateToken, RolePermissionController.removePermissionsFromRole);
router.delete('/role-permissions/role/:roleId/all-permissions', authenticateToken, RolePermissionController.deleteAllRolePermissions);
router.post('/role-permissions', authenticateToken, RolePermissionController.createRolePermission);
router.delete('/role-permissions/:id', authenticateToken, RolePermissionController.deleteRolePermission);

// ============================================================================
// USER ACCESS ROUTES
// ============================================================================

// User access management endpoints
router.get('/user-access', authenticateToken, UserAccessController.getAllUserAccess);
router.get('/user-access/users', authenticateToken, UserAccessController.getUsersWithPermissionCounts);
router.get('/user-access/user/:userId', authenticateToken, UserAccessController.getUserAccessByUserId);
router.get('/user-access/user/:userId/permissions', authenticateToken, UserAccessController.getUserPermissions);
router.get('/user-access/user/:userId/has-permission', authenticateToken, UserAccessController.checkUserPermission);
router.post('/user-access/user/:userId/permissions', authenticateToken, UserAccessController.assignPermissionsToUser);
router.put('/user-access/user/:userId/permissions', authenticateToken, UserAccessController.updateUserPermissions);
router.delete('/user-access/user/:userId/permissions', authenticateToken, UserAccessController.removePermissionsFromUser);
router.delete('/user-access/user/:userId/all-permissions', authenticateToken, UserAccessController.deleteAllUserPermissions);

export default router; 