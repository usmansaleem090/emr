-- Create clinic_location_services table
CREATE TABLE IF NOT EXISTS clinic_location_services (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    location_id INTEGER NOT NULL REFERENCES clinic_locations(id) ON DELETE CASCADE,
    service_name TEXT NOT NULL,
    service_category TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_location_services_clinic_id ON clinic_location_services(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_location_services_location_id ON clinic_location_services(location_id);
CREATE INDEX IF NOT EXISTS idx_clinic_location_services_category ON clinic_location_services(service_category);
CREATE INDEX IF NOT EXISTS idx_clinic_location_services_active ON clinic_location_services(is_active); 