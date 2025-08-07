import { UserDAL } from "../dal/securityDAL";
import { RoleDAL } from "../dal/securityDAL";
import { ClinicDAL } from "../dal";
import { ModuleDAL } from "../dal/securityDAL";
import { OperationDAL } from "../dal/securityDAL";
import { db } from "../../db";
import { moduleOperations } from "../models//securitySchema";

export class DataSeeder {
  static async seedSuperAdmin(): Promise<void> {
    try {
      console.log("🌱 Starting data seeding...");

      // Check if superadmin already exists
      const existingAdmin = await UserDAL.findByEmail("superadmin@emr.com");
      if (existingAdmin) {
        console.log("✅ Superadmin already exists");
        return;
      }

      // 1. Create SuperAdmin Role
      const superAdminRole = await RoleDAL.create({
        name: "SuperAdmin",
        description: "System Super Administrator with full access",
        isPracticeRole: false
      });

      // 2. Create default clinic
      const defaultClinic = await ClinicDAL.createClinic({
        name: "EMR System Clinic",
        address: "System Default Clinic",
        phone: "+1-800-EMR-HELP",
        email: "clinic@gmail.com",
      });

      // 3. Create SuperAdmin User
      const superAdmin = await UserDAL.create({
        username: "superadmin",
        email: "superadmin@emr.com",
        passwordHash: "superadmin123", // This will be hashed in the UserDAL.create method
        userType: "SuperAdmin",
        clinicId: defaultClinic.id,
        roleId: superAdminRole.id,
        status: "active"
      });

      // 4. Assign SuperAdmin role to user
      // await RoleDAL.assignRoleToUser(superAdmin.id, superAdminRole.id);

      // 5. Create default modules
      const modules = [
        { name: "User Management", description: "Manage users, roles, and permissions" },
        { name: "Clinic Management", description: "Manage clinic information and settings" },
        { name: "Patient Management", description: "Manage patient records and information" },
        { name: "Appointment Management", description: "Manage appointments and scheduling" },
        { name: "Medical Records", description: "Manage medical records and documentation" },
        { name: "Billing", description: "Manage billing and payments" },
        { name: "Reports", description: "Generate and view system reports" },
        { name: "System Settings", description: "Configure system settings and preferences" }
      ];

      const createdModules = [];
      for (const moduleData of modules) {
        const module = await ModuleDAL.create(moduleData);
        createdModules.push(module);
      }

      // 6. Create default operations
      const operations = [
        { name: "Create", description: "Create new records" },
        { name: "Read", description: "View and read records" },
        { name: "Update", description: "Update existing records" },
        { name: "Delete", description: "Delete records" },
        { name: "Export", description: "Export data" },
        { name: "Import", description: "Import data" },
        { name: "Approve", description: "Approve actions or records" },
        { name: "Reject", description: "Reject actions or records" }
      ];

      const createdOperations = [];
      for (const operationData of operations) {
        const operation = await OperationDAL.create(operationData);
        createdOperations.push(operation);
      }

      // 7. Create module-operation associations (all modules get all operations for SuperAdmin)
      const moduleOperationIds = [];
      for (const module of createdModules) {
        for (const operation of createdOperations) {
          const [moduleOperation] = await db.insert(moduleOperations).values({
            moduleId: module.id,
            operationId: operation.id
          }).returning();
          moduleOperationIds.push(moduleOperation.id);
        }
      }

      // 8. Assign all permissions to SuperAdmin role
      const { RolePermissionDAL } = await import('../dal/securityDAL');
      await RolePermissionDAL.assignPermissionsToRole(superAdminRole.id, moduleOperationIds);

      console.log("✅ Data seeding completed successfully!");
      console.log("📧 SuperAdmin Email: superadmin@emr.com");
      console.log("🔐 SuperAdmin Password: superadmin123");
      
    } catch (error) {
      console.error("❌ Error seeding data:", error);
      throw error;
    }
  }

  static async seedAdditionalRoles(): Promise<void> {
    try {
      console.log("🌱 Seeding additional roles...");

      const additionalRoles = [
        { name: "Doctor", description: "Medical doctor with patient management access", isPracticeRole: true },
        { name: "Nurse", description: "Nursing staff with patient care access", isPracticeRole: true },
        { name: "Receptionist", description: "Front desk with appointment and basic patient access", isPracticeRole: true },
        { name: "Admin", description: "Clinic administrator with management access", isPracticeRole: true }
      ];

      for (const roleData of additionalRoles) {
        const existingRole = await RoleDAL.findByName(roleData.name);
        if (!existingRole) {
          await RoleDAL.create(roleData);
          console.log(`✅ Created role: ${roleData.name}`);
        }
      }

      console.log("✅ Additional roles seeded successfully!");
    } catch (error) {
      console.error("❌ Error seeding additional roles:", error);
      throw error;
    }
  }
}