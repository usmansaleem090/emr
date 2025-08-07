-- Create clinic_locations table
CREATE TABLE IF NOT EXISTS clinic_locations (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    hours TEXT,
    services TEXT[] DEFAULT '{}',
    providers TEXT[] DEFAULT '{}',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_locations_clinic_id ON clinic_locations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_locations_name ON clinic_locations(name); 