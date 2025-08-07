// import { Pool, neonConfig } from '@neondatabase/serverless';
// import { drizzle } from 'drizzle-orm/neon-serverless';
// import ws from "ws";

// // Import all schemas from the shared schema
// import * as schema from "../shared/schema";

// neonConfig.webSocketConstructor = ws;

// if (!process.env.DATABASE_URL) {
//   throw new Error(
//     "DATABASE_URL must be set. Did you forget to provision a database?",
//   );



// export const pool = new Pool({ connectionString: process.env.DATABASE_URL });
// export const db = drizzle({ client: pool, schema });



import * as schema from "@shared/schema";
import dotenv from "dotenv";
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
const {Pool}=pkg;
dotenv.config();

// Logging function
const log = (message: string) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${message}`);
};

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}


export const pool = new Pool({ connectionString: dbUrl });

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    log("❌ Failed to connect to database: " + err.message);
    throw err;
  } else {
    log("✅ Successfully connected to database");
    release();
  }
});

export const db = drizzle({ client: pool, schema });