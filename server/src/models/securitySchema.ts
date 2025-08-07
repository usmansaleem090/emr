import { pgTable, serial, text, timestamp, integer, boolean, unique } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// ============================================================================
// USER SCHEMA
// ============================================================================

// User type enum
export const userTypeEnum = ["SuperAdmin", "Clinic", "Doctor", "Patient", "Staff", "HawkLogix"] as const;

// Users table definition
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  userType: text("user_type", { enum: userTypeEnum }).notNull(),
  clinicId: integer("clinic_id"),
  roleId: integer("role_id"),
  firstName: text("first_name"),
  lastName: text("last_name"),
  phone: text("phone"),
  status: text("status").notNull().default("active"),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// ============================================================================
// ROLE SCHEMA
// ============================================================================

// Roles table definition
export const roles = pgTable("roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isPracticeRole: boolean("is_practice_role").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ============================================================================
// MODULE SCHEMA
// ============================================================================

// Modules table definition
export const modules = pgTable("modules", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// ============================================================================
// OPERATION SCHEMA
// ============================================================================

// Operations table definition
export const operations = pgTable("operations", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
});

// ============================================================================
// MODULE OPERATION SCHEMA
// ============================================================================

// Module operations junction table definition
export const moduleOperations = pgTable("module_operations", {
  id: serial("id").primaryKey(),
  moduleId: integer("module_id").notNull(),
  operationId: integer("operation_id").notNull(),
});

// ============================================================================
// ROLE PERMISSION SCHEMA
// ============================================================================

// Role permissions table definition
export const rolePermissions = pgTable("role_permissions", {
  id: serial("id").primaryKey(),
  roleId: integer("role_id").notNull(),
  moduleOperationId: integer("module_operation_id").notNull(),
});

// ============================================================================
// USER ACCESS SCHEMA
// ============================================================================

// User Access table - allows direct assignment of module permissions to users
export const userAccess = pgTable("user_access", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  moduleOperationId: integer("module_operation_id").notNull().references(() => moduleOperations.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure a user can't have duplicate permissions for the same module operation
  uniqueUserModuleOperation: unique().on(table.userId, table.moduleOperationId),
}));

// ============================================================================
// ZOD SCHEMAS
// ============================================================================

// User schemas
export const insertUserSchema = createInsertSchema(users, {
  email: z.string().email(),
  username: z.string().min(3).max(50),
  passwordHash: z.string().min(6),
  userType: z.enum(userTypeEnum),
  clinicId: z.number().optional(),
  roleId: z.number().optional()
}).omit({
  id: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
  rememberMe: z.boolean().optional(),
});

// Role schemas
export const insertRoleSchema = createInsertSchema(roles, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isPracticeRole: z.boolean().default(false),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Module schemas
export const insertModuleSchema = createInsertSchema(modules, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
}).omit({
  id: true,
});

// Operation schemas
export const insertOperationSchema = createInsertSchema(operations, {
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
}).omit({
  id: true,
});

// Module Operation schemas
export const insertModuleOperationSchema = createInsertSchema(moduleOperations, {
  moduleId: z.number().min(1),
  operationId: z.number().min(1),
}).omit({
  id: true,
});

// Role Permission schemas
export const insertRolePermissionSchema = createInsertSchema(rolePermissions, {
  roleId: z.number().min(1),
  moduleOperationId: z.number().min(1),
}).omit({
  id: true,
});

// User Access schemas
export const insertUserAccessSchema = createInsertSchema(userAccess, {
  userId: z.number().positive(),
  moduleOperationId: z.number().positive(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// ============================================================================
// TYPES
// ============================================================================

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type LoginData = z.infer<typeof loginSchema>;

export type Role = typeof roles.$inferSelect;
export type InsertRole = z.infer<typeof insertRoleSchema>;

export type Module = typeof modules.$inferSelect;
export type InsertModule = z.infer<typeof insertModuleSchema>;

export type Operation = typeof operations.$inferSelect;
export type InsertOperation = z.infer<typeof insertOperationSchema>;

export type ModuleOperation = typeof moduleOperations.$inferSelect;
export type InsertModuleOperation = z.infer<typeof insertModuleOperationSchema>;

export type RolePermission = typeof rolePermissions.$inferSelect;
export type InsertRolePermission = z.infer<typeof insertRolePermissionSchema>;

export type UserAccess = typeof userAccess.$inferSelect;
export type InsertUserAccess = z.infer<typeof insertUserAccessSchema>; 