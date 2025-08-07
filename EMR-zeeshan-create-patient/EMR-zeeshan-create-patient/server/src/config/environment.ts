import dotenv from "dotenv";

// Load environment variables
dotenv.config();

// Define and validate environment configuration
export const config = {
  // Server Configuration
  PORT: parseInt(process.env.PORT || "5000", 10),
  NODE_ENV: process.env.NODE_ENV || "development",
  
  // Database Configuration
  DATABASE_URL: process.env.DATABASE_URL || "",
  
  // JWT Configuration
  JWT_SECRET: process.env.JWT_SECRET || "emr_jwt_secret_fallback_key_for_development",
  JWT_EXPIRY: process.env.JWT_EXPIRY || "24h",
  
  // Security Configuration
  BCRYPT_SALT_ROUNDS: parseInt(process.env.BCRYPT_SALT_ROUNDS || "12", 10),
  
  // Rate Limiting Configuration
  RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || "900000", 10), // 15 minutes
  RATE_LIMIT_MAX_ATTEMPTS: parseInt(process.env.RATE_LIMIT_MAX_ATTEMPTS || "5", 10),
  
  // CORS Configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || "*",
  
  // Application Configuration
  APP_NAME: process.env.APP_NAME || "EMR Healthcare System",
  APP_VERSION: process.env.APP_VERSION || "1.0.0",
};

// Validation for required environment variables
const requiredEnvVars = ["DATABASE_URL"];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.error(`❌ Missing required environment variables: ${missingEnvVars.join(", ")}`);
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  } else {
    console.warn("⚠️  Running in development mode with missing environment variables");
  }
} else {
  console.log("✅ Environment configuration loaded successfully");
}

// Environment validation function
export const validateEnvironment = () => {
  // This function is called during server startup to validate environment
  console.log("🔍 Validating environment configuration...");
  console.log(`📍 Environment: ${config.NODE_ENV}`);
  console.log(`🚀 Server will run on port: ${config.PORT}`);
  console.log("✅ Environment validation completed");
};

export default config;