import { db } from "../../db";

// Test database connection
export const testConnection = async (): Promise<boolean> => {
  try {
    // Simple query to test the connection
    await db.execute(`SELECT 1`);
    console.log("✅ Database connection successful");
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error);
    return false;
  }
};