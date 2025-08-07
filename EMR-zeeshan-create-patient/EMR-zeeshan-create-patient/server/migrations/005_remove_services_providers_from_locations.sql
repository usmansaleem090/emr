-- Remove services and providers columns from clinic_locations table
-- These fields are now handled by the clinic_location_services table

ALTER TABLE clinic_locations DROP COLUMN IF EXISTS services;
ALTER TABLE clinic_locations DROP COLUMN IF EXISTS providers; 