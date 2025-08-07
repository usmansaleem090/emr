-- Add locationId column to clinic_staff table
ALTER TABLE clinic_staff ADD COLUMN location_id INTEGER REFERENCES clinic_locations(id) ON DELETE SET NULL;

-- Add index for better performance
CREATE INDEX idx_clinic_staff_location_id ON clinic_staff(location_id); 