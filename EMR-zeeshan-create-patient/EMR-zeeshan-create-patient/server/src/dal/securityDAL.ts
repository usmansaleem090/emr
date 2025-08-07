import { db } from "../../db";
import { 
  users, type User, type InsertUser,
  roles, type Role, type InsertRole,
  modules, type Module, type InsertModule,
  operations, type Operation, type InsertOperation,
  moduleOperations, type ModuleOperation, type InsertModuleOperation,
  rolePermissions, type RolePermission, type InsertRolePermission,
  userAccess, type UserAccess, type InsertUserAccess
} from "../models/securitySchema";
import { eq, and, inArray, count, desc, sql } from "drizzle-orm";

// ============================================================================
// USER DAL
// ============================================================================

export class UserDAL {
  // Basic CRUD operations
  static async findById(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

   static async findByClinicId(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.clinicId, id));
    return user;
  }
  

  static async findByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  static async findByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  static async create(userData: InsertUser): Promise<User> {
    const [newUser] = await db
      .insert(users)
      .values({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return newUser;
  }

  static async getAllUsers(): Promise<User[]> {
    return db.select().from(users).orderBy(desc(users.createdAt));
  }

  static async update(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const [updatedUser] = await db
      .update(users)
      .set({
        ...userData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, id))
      .returning();
    
    return updatedUser;
  }

  static async deleteUser(id: number): Promise<void> {
    await db.delete(users).where(eq(users.id, id));
  }

  // Enhanced operations
  static async getUserPermissions(userId: number): Promise<any[]> {
    const result = await db.execute(sql`
      SELECT 
        ua.id,
        ua.user_id as "userId",
        ua.module_operation_id as "moduleOperationId",
        mo.module_id as "moduleId",
        mo.operation_id as "operationId",
        m.name as "moduleName",
        o.name as "operationName"
      FROM user_access ua
      JOIN module_operations mo ON ua.module_operation_id = mo.id
      JOIN modules m ON mo.module_id = m.id
      JOIN operations o ON mo.operation_id = o.id
      WHERE ua.user_id = ${userId}
      ORDER BY m.name, o.name
    `);

    return result.rows || [];
  }

  static async getUsersByRoleId(roleId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.roleId, roleId))
      .orderBy(desc(users.createdAt));
  }

  static async getUsersByClinicId(clinicId: number): Promise<User[]> {
    return db
      .select()
      .from(users)
      .where(eq(users.clinicId, clinicId))
      .orderBy(desc(users.createdAt));
  }

  static async updateLastLogin(id: number): Promise<void> {
    await db
      .update(users)
      .set({ lastLoginAt: new Date() })
      .where(eq(users.id, id));
  }
}

// ============================================================================
// ROLE DAL
// ============================================================================

export class RoleDAL {
  // Basic CRUD operations
  static async findById(id: number): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.id, id));
    return role;
  }

  static async findByName(name: string): Promise<Role | undefined> {
    const [role] = await db.select().from(roles).where(eq(roles.name, name));
    return role;
  }

  static async create(roleData: InsertRole): Promise<Role> {
    const [newRole] = await db
      .insert(roles)
      .values({
        ...roleData,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();
    
    return newRole;
  }

  static async getAllRoles(): Promise<Role[]> {
    return db.select().from(roles).orderBy(desc(roles.createdAt));
  }

  static async getPracticeRoles(): Promise<Role[]> {
    return db
      .select()
      .from(roles)
      .where(eq(roles.isPracticeRole, true))
      .orderBy(roles.name);
  }

  static async getNonPracticeRoles(): Promise<Role[]> {
    return db
      .select()
      .from(roles)
      .where(eq(roles.isPracticeRole, false))
      .orderBy(roles.name);
  }

  static async update(id: number, roleData: Partial<InsertRole>): Promise<Role | undefined> {
    const [updatedRole] = await db
      .update(roles)
      .set({
        ...roleData,
        updatedAt: new Date(),
      })
      .where(eq(roles.id, id))
      .returning();
    
    return updatedRole;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(roles).where(eq(roles.id, id));
  }

  // Enhanced operations with counts
  static async getRolesWithCounts(rolesList: Role[]): Promise<any[]> {
    const rolesWithCounts = await Promise.all(
      rolesList.map(async (role) => {
        // Get permission count using RolePermissionDAL
        const permissionCount = await RolePermissionDAL.getRolePermissionCount(role.id);
        
        // Get user count
        const userResult = await db.execute(sql`
          SELECT COUNT(*) as count 
          FROM users 
          WHERE role_id = ${role.id}
        `);
        const userCount = userResult.rows?.[0]?.count || 0;
        
        return {
          ...role,
          permissionCount: Number(permissionCount),
          userCount: Number(userCount)
        };
      })
    );

    return rolesWithCounts;
  }

  static async getRoleUserCount(roleId: number): Promise<number> {
    const result = await db.execute(sql`
      SELECT COUNT(*) as count 
      FROM users 
      WHERE role_id = ${roleId}
    `);
    return Number(result.rows?.[0]?.count || 0);
  }
}

// ============================================================================
// MODULE DAL
// ============================================================================

export class ModuleDAL {
  // Basic CRUD operations
  static async findById(id: number): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.id, id));
    return module;
  }

  static async findByName(name: string): Promise<Module | undefined> {
    const [module] = await db.select().from(modules).where(eq(modules.name, name));
    return module;
  }

  static async create(moduleData: InsertModule): Promise<Module> {
    const [newModule] = await db
      .insert(modules)
      .values(moduleData)
      .returning();
    
    return newModule;
  }

  static async getAllModules(): Promise<Module[]> {
    return db.select().from(modules).orderBy(modules.name);
  }

  static async update(id: number, moduleData: Partial<InsertModule>): Promise<Module | undefined> {
    const [updatedModule] = await db
      .update(modules)
      .set(moduleData)
      .where(eq(modules.id, id))
      .returning();
    
    return updatedModule;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(modules).where(eq(modules.id, id));
  }
}

// ============================================================================
// OPERATION DAL
// ============================================================================

export class OperationDAL {
  // Basic CRUD operations
  static async findById(id: number): Promise<Operation | undefined> {
    const [operation] = await db.select().from(operations).where(eq(operations.id, id));
    return operation;
  }

  static async findByName(name: string): Promise<Operation | undefined> {
    const [operation] = await db.select().from(operations).where(eq(operations.name, name));
    return operation;
  }

  static async create(operationData: InsertOperation): Promise<Operation> {
    const [newOperation] = await db
      .insert(operations)
      .values(operationData)
      .returning();
    
    return newOperation;
  }

  static async getAllOperations(): Promise<Operation[]> {
    return db.select().from(operations).orderBy(operations.name);
  }

  static async update(id: number, operationData: Partial<InsertOperation>): Promise<Operation | undefined> {
    const [updatedOperation] = await db
      .update(operations)
      .set(operationData)
      .where(eq(operations.id, id))
      .returning();
    
    return updatedOperation;
  }

  static async delete(id: number): Promise<void> {
    await db.delete(operations).where(eq(operations.id, id));
  }
}

// ============================================================================
// MODULE OPERATION DAL
// ============================================================================

export class ModuleOperationDAL {
  // Basic CRUD operations
  static async createModuleOperation(data: InsertModuleOperation): Promise<ModuleOperation> {
    const [result] = await db.insert(moduleOperations).values(data).returning();
    return result;
  }

  static async getModuleOperations(moduleId: number): Promise<any[]> {
    return await db
      .select({
        id: operations.id,
        name: operations.name,
        description: operations.description
      })
      .from(moduleOperations)
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id))
      .where(eq(moduleOperations.moduleId, moduleId));
  }

  static async deleteModuleOperations(moduleId: number): Promise<void> {
    await db
      .delete(moduleOperations)
      .where(eq(moduleOperations.moduleId, moduleId));
  }

  static async deleteModuleOperation(moduleId: number, operationId: number): Promise<void> {
    await db
      .delete(moduleOperations)
      .where(
        and(
          eq(moduleOperations.moduleId, moduleId),
          eq(moduleOperations.operationId, operationId)
        )
      );
  }

  static async assignOperationsToModule(moduleId: number, operationIds: number[]): Promise<void> {
    // First, delete existing operations for the module
    await this.deleteModuleOperations(moduleId);
    
    // Then, insert new operations
    if (operationIds.length > 0) {
      const insertData = operationIds.map(operationId => ({
        moduleId,
        operationId,
      }));
      
      await db.insert(moduleOperations).values(insertData);
    }
  }

  // Get all modules and operations separately
  static async getModulesAndOperations() {
    const [allModules, allOperations] = await Promise.all([
      db.select().from(modules),
      db.select().from(operations)
    ]);
    
    return { modules: allModules, operations: allOperations };
  }

  // Get all module operations with related module and operation details
  static async getAllModuleOperationsWithDetails() {
    const result = await db
      .select({
        id: moduleOperations.id,
        moduleId: moduleOperations.moduleId,
        operationId: moduleOperations.operationId,
        module: {
          id: modules.id,
          name: modules.name,
          description: modules.description,
        },
        operation: {
          id: operations.id,
          name: operations.name,
          description: operations.description,
        },
      })
      .from(moduleOperations)
      .innerJoin(modules, eq(moduleOperations.moduleId, modules.id))
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id))
      .orderBy(modules.name, operations.name);

    return result;
  }

  // Get all module operations (basic)
  static async getAllModuleOperations(): Promise<ModuleOperation[]> {
    return db.select().from(moduleOperations);
  }
}

// ============================================================================
// ROLE PERMISSION DAL
// ============================================================================

export class RolePermissionDAL {
  // Get all role permissions
  static async getAllRolePermissions(): Promise<RolePermission[]> {
    return db.select().from(rolePermissions);
  }

  // Get role permissions by role ID
  static async getRolePermissionsByRoleId(roleId: number): Promise<RolePermission[]> {
    return db.select().from(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  // Get role permissions with module and operation details
  static async getRolePermissionsWithDetails(roleId: number) {
    const result = await db
      .select({
        id: rolePermissions.id,
        roleId: rolePermissions.roleId,
        moduleOperationId: rolePermissions.moduleOperationId,
        module: {
          id: modules.id,
          name: modules.name,
          description: modules.description,
        },
        operation: {
          id: operations.id,
          name: operations.name,
          description: operations.description,
        },
      })
      .from(rolePermissions)
      .innerJoin(moduleOperations, eq(rolePermissions.moduleOperationId, moduleOperations.id))
      .innerJoin(modules, eq(moduleOperations.moduleId, modules.id))
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id))
      .where(eq(rolePermissions.roleId, roleId));

    return result;
  }

  // Get all role permissions with details for all roles
  static async getAllRolePermissionsWithDetails() {
    const result = await db
      .select({
        id: rolePermissions.id,
        roleId: rolePermissions.roleId,
        moduleOperationId: rolePermissions.moduleOperationId,
        role: {
          id: roles.id,
          name: roles.name,
          description: roles.description,
        },
        module: {
          id: modules.id,
          name: modules.name,
          description: modules.description,
        },
        operation: {
          id: operations.id,
          name: operations.name,
          description: operations.description,
        },
      })
      .from(rolePermissions)
      .innerJoin(roles, eq(rolePermissions.roleId, roles.id))
      .innerJoin(moduleOperations, eq(rolePermissions.moduleOperationId, moduleOperations.id))
      .innerJoin(modules, eq(moduleOperations.moduleId, modules.id))
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id));

    return result;
  }

  // Check if role has specific permission
  static async hasPermission(roleId: number, moduleName: string, operationName: string): Promise<boolean> {
    const result = await db
      .select()
      .from(rolePermissions)
      .innerJoin(moduleOperations, eq(rolePermissions.moduleOperationId, moduleOperations.id))
      .innerJoin(modules, eq(moduleOperations.moduleId, modules.id))
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id))
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(modules.name, moduleName),
          eq(operations.name, operationName)
        )
      )
      .limit(1);

    return result.length > 0;
  }

  // Get all permissions for a role (module and operation names)
  static async getRolePermissions(roleId: number): Promise<Array<{ moduleName: string; operationName: string }>> {
    const result = await db
      .select({
        moduleName: modules.name,
        operationName: operations.name,
      })
      .from(rolePermissions)
      .innerJoin(moduleOperations, eq(rolePermissions.moduleOperationId, moduleOperations.id))
      .innerJoin(modules, eq(moduleOperations.moduleId, modules.id))
      .innerJoin(operations, eq(moduleOperations.operationId, operations.id))
      .where(eq(rolePermissions.roleId, roleId));

    return result;
  }

  // Assign permissions to role
  static async assignPermissionsToRole(roleId: number, moduleOperationIds: number[]): Promise<void> {
    if (moduleOperationIds.length === 0) return;

    // Check if role exists
    const roleExists = await db.select().from(roles).where(eq(roles.id, roleId)).limit(1);
    if (roleExists.length === 0) {
      throw new Error('Role not found');
    }

    // Check if all module operations exist
    const existingModuleOperations = await db
      .select()
      .from(moduleOperations)
      .where(inArray(moduleOperations.id, moduleOperationIds));

    if (existingModuleOperations.length !== moduleOperationIds.length) {
      throw new Error('One or more module operations not found');
    }

    // Insert permissions (ignore duplicates due to unique constraint)
    const values = moduleOperationIds.map(moduleOperationId => ({
      roleId,
      moduleOperationId,
    }));

    await db.insert(rolePermissions).values(values).onConflictDoNothing();
  }

  // Remove permissions from role
  static async removePermissionsFromRole(roleId: number, moduleOperationIds: number[]): Promise<void> {
    if (moduleOperationIds.length === 0) return;

    await db
      .delete(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          inArray(rolePermissions.moduleOperationId, moduleOperationIds)
        )
      );
  }

  // Update role permissions (replace all existing permissions with new ones)
  static async updateRolePermissions(roleId: number, moduleOperationIds: number[]): Promise<void> {
    return await db.transaction(async (tx) => {
      // Remove all existing permissions
      await tx.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));

      // Assign new permissions
      if (moduleOperationIds.length > 0) {
        await RolePermissionDAL.assignPermissionsToRole(roleId, moduleOperationIds);
      }
    });
  }

  // Delete all permissions for a role
  static async deleteAllRolePermissions(roleId: number): Promise<void> {
    await db.delete(rolePermissions).where(eq(rolePermissions.roleId, roleId));
  }

  // Get roles with their permission counts
  static async getRolesWithPermissionCounts() {
    // First get all roles
    const allRoles = await db.select({
      id: roles.id,
      name: roles.name,
      description: roles.description,
    }).from(roles);

    // Then get permission counts for each role
    const rolesWithCounts = await Promise.all(
      allRoles.map(async (role) => {
        const permissionCount = await db
          .select({ count: count() })
          .from(rolePermissions)
          .where(eq(rolePermissions.roleId, role.id));

        return {
          role,
          permissionCount: Number(permissionCount[0]?.count || 0)
        };
      })
    );

    return rolesWithCounts;
  }

  // Get permission count for a specific role
  static async getRolePermissionCount(roleId: number): Promise<number> {
    const result = await db
      .select({ count: count() })
      .from(rolePermissions)
      .where(eq(rolePermissions.roleId, roleId));

    return Number(result[0]?.count || 0);
  }

  // Create a single role permission
  static async create(rolePermission: InsertRolePermission): Promise<RolePermission> {
    const result = await db.insert(rolePermissions).values(rolePermission).returning();
    return result[0];
  }

  // Delete a single role permission
  static async delete(id: number): Promise<void> {
    await db.delete(rolePermissions).where(eq(rolePermissions.id, id));
  }

  // Check if role permission exists
  static async exists(roleId: number, moduleOperationId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(rolePermissions)
      .where(
        and(
          eq(rolePermissions.roleId, roleId),
          eq(rolePermissions.moduleOperationId, moduleOperationId)
        )
      )
      .limit(1);

    return result.length > 0;
  }
}

// ============================================================================
// USER ACCESS DAL
// ============================================================================

export class UserAccessDAL {
  // Get all user access records
  static async getAllUserAccess(): Promise<UserAccess[]> {
    return db.select().from(userAccess);
  }

  // Get user access by user ID
  static async getUserAccessByUserId(userId: number): Promise<UserAccess[]> {
    return db.select().from(userAccess).where(eq(userAccess.userId, userId));
  }

  // Get user access with details
  static async getUserAccessWithDetails(userId: number) {
    const result = await db.execute(sql`
      SELECT 
        ua.id,
        ua.user_id as "userId",
        ua.module_operation_id as "moduleOperationId",
        mo.module_id as "moduleId",
        mo.operation_id as "operationId",
        m.name as "moduleName",
        o.name as "operationName"
      FROM user_access ua
      JOIN module_operations mo ON ua.module_operation_id = mo.id
      JOIN modules m ON mo.module_id = m.id
      JOIN operations o ON mo.operation_id = o.id
      WHERE ua.user_id = ${userId}
      ORDER BY m.name, o.name
    `);

    return result.rows || [];
  }

  // Get all users with permission counts
  static async getUsersWithPermissionCounts() {
    const result = await db.execute(sql`
      SELECT 
        u.id,
        u.username,
        u.email,
        u.user_type as "userType",
        u.first_name as "firstName",
        u.last_name as "lastName",
        u.status,
        COUNT(ua.id) as permission_count
      FROM users u
      LEFT JOIN user_access ua ON u.id = ua.user_id
      GROUP BY u.id, u.username, u.email, u.user_type, u.first_name, u.last_name, u.status
      ORDER BY u.created_at DESC
    `);

    return result.rows || [];
  }

  // Get user permissions (module and operation names)
  static async getUserPermissions(userId: number): Promise<Array<{ moduleName: string; operationName: string }>> {
    const result = await db.execute(sql`
      SELECT 
        m.name as "moduleName",
        o.name as "operationName"
      FROM user_access ua
      JOIN module_operations mo ON ua.module_operation_id = mo.id
      JOIN modules m ON mo.module_id = m.id
      JOIN operations o ON mo.operation_id = o.id
      WHERE ua.user_id = ${userId}
      ORDER BY m.name, o.name
    `);

    return result.rows || [];
  }

  // Check if user has specific permission
  static async hasPermission(userId: number, moduleName: string, operationName: string): Promise<boolean> {
    const result = await db.execute(sql`
      SELECT 1
      FROM user_access ua
      JOIN module_operations mo ON ua.module_operation_id = mo.id
      JOIN modules m ON mo.module_id = m.id
      JOIN operations o ON mo.operation_id = o.id
      WHERE ua.user_id = ${userId} 
        AND m.name = ${moduleName} 
        AND o.name = ${operationName}
      LIMIT 1
    `);

    return (result.rows && result.rows.length > 0);
  }

  // Assign permissions to user
  static async assignPermissionsToUser(userId: number, moduleOperationIds: number[]): Promise<void> {
    if (moduleOperationIds.length === 0) return;

    // Check if user exists
    const userExists = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (userExists.length === 0) {
      throw new Error('User not found');
    }

    // Check if all module operations exist
    const existingModuleOperations = await db
      .select()
      .from(moduleOperations)
      .where(inArray(moduleOperations.id, moduleOperationIds));

    if (existingModuleOperations.length !== moduleOperationIds.length) {
      throw new Error('One or more module operations not found');
    }

    // Insert permissions (ignore duplicates due to unique constraint)
    const values = moduleOperationIds.map(moduleOperationId => ({
      userId,
      moduleOperationId,
    }));

    await db.insert(userAccess).values(values).onConflictDoNothing();
  }

  // Update user permissions (replace all existing permissions with new ones)
  static async updateUserPermissions(userId: number, moduleOperationIds: number[]): Promise<void> {
    return await db.transaction(async (tx) => {
      // Remove all existing permissions
      await tx.delete(userAccess).where(eq(userAccess.userId, userId));

      // Assign new permissions
      if (moduleOperationIds.length > 0) {
        await UserAccessDAL.assignPermissionsToUser(userId, moduleOperationIds);
      }
    });
  }

  // Remove permissions from user
  static async removePermissionsFromUser(userId: number, moduleOperationIds: number[]): Promise<void> {
    if (moduleOperationIds.length === 0) return;

    await db
      .delete(userAccess)
      .where(
        and(
          eq(userAccess.userId, userId),
          inArray(userAccess.moduleOperationId, moduleOperationIds)
        )
      );
  }

  // Delete all permissions for a user
  static async deleteAllUserPermissions(userId: number): Promise<void> {
    await db.delete(userAccess).where(eq(userAccess.userId, userId));
  }

  // Create a single user access record
  static async create(userAccessData: InsertUserAccess): Promise<UserAccess> {
    const [result] = await db.insert(userAccess).values(userAccessData).returning();
    return result;
  }

  // Delete a single user access record
  static async delete(id: number): Promise<void> {
    await db.delete(userAccess).where(eq(userAccess.id, id));
  }

  // Check if user access exists
  static async exists(userId: number, moduleOperationId: number): Promise<boolean> {
    const result = await db
      .select()
      .from(userAccess)
      .where(
        and(
          eq(userAccess.userId, userId),
          eq(userAccess.moduleOperationId, moduleOperationId)
        )
      )
      .limit(1);

    return result.length > 0;
  }
} 