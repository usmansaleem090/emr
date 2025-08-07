import { DataSeeder } from './seedData';

async function main() {
  try {
    console.log('🚀 Starting database seeding...');
    
    // Seed super admin and basic data
    await DataSeeder.seedSuperAdmin();
    
    // Seed additional roles
    await DataSeeder.seedAdditionalRoles();
    
    console.log('🎉 All seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

main(); 