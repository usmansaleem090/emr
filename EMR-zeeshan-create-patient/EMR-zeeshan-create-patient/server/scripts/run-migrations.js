import pkg from 'pg';
const { Pool } = pkg;
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'emr_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
});

async function runMigrations() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migrations...');
    
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    
    // Read and execute the specialties migration
    const specialtiesMigrationPath = path.join(__dirname, '../migrations/001_create_specialties_tables.sql');
    const specialtiesMigrationSQL = fs.readFileSync(specialtiesMigrationPath, 'utf8');
    
    console.log('Executing specialties tables migration...');
    await client.query(specialtiesMigrationSQL);
    
    // Read and execute the insurance migration
    const insuranceMigrationPath = path.join(__dirname, '../migrations/002_create_insurance_tables.sql');
    const insuranceMigrationSQL = fs.readFileSync(insuranceMigrationPath, 'utf8');
    
    console.log('Executing insurance tables migration...');
    await client.query(insuranceMigrationSQL);
    
    // Read and execute the clinic locations migration
    const locationsMigrationPath = path.join(__dirname, '../migrations/003_create_clinic_locations_table.sql');
    const locationsMigrationSQL = fs.readFileSync(locationsMigrationPath, 'utf8');
    
    console.log('Executing clinic locations table migration...');
    await client.query(locationsMigrationSQL);
    
    // Read and execute the clinic location services migration
    const locationServicesMigrationPath = path.join(__dirname, '../migrations/004_create_clinic_location_services_table.sql');
    const locationServicesMigrationSQL = fs.readFileSync(locationServicesMigrationPath, 'utf8');
    
    console.log('Executing clinic location services table migration...');
    await client.query(locationServicesMigrationSQL);
    
    // Read and execute the remove services/providers from locations migration
    const removeServicesMigrationPath = path.join(__dirname, '../migrations/005_remove_services_providers_from_locations.sql');
    const removeServicesMigrationSQL = fs.readFileSync(removeServicesMigrationPath, 'utf8');
    
    console.log('Executing remove services/providers from locations migration...');
    await client.query(removeServicesMigrationSQL);
    
    console.log('✅ All migrations completed successfully!');
    
    // Verify the tables were created
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('medical_specialties', 'clinic_specialties', 'insurance_providers', 'clinic_insurances', 'clinic_locations', 'clinic_location_services')
      ORDER BY table_name;
    `);
    
    console.log('Created tables:', tablesResult.rows.map(row => row.table_name));
    
    // Check if specialties were inserted
    const specialtiesCount = await client.query('SELECT COUNT(*) FROM medical_specialties');
    console.log(`Inserted ${specialtiesCount.rows[0].count} medical specialties`);
    
    // Check if insurance providers were inserted
    const insuranceCount = await client.query('SELECT COUNT(*) FROM insurance_providers');
    console.log(`Inserted ${insuranceCount.rows[0].count} insurance providers`);
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

// Run migrations if this script is executed directly
// Run migrations if this script is executed directly
runMigrations()
  .then(() => {
    console.log('Migration script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration script failed:', error);
    process.exit(1);
  });

export { runMigrations }; 