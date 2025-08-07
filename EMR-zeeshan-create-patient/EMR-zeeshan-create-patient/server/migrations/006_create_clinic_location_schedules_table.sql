-- Create clinic_location_schedules table
CREATE TABLE IF NOT EXISTS clinic_location_schedules (
    id SERIAL PRIMARY KEY,
    location_id INTEGER NOT NULL REFERENCES clinic_locations(id) ON DELETE CASCADE,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    schedule_name TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    effective_from DATE NOT NULL,
    effective_to DATE,
    weekly_schedule JSONB NOT NULL,
    time_zone TEXT DEFAULT 'America/New_York',
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_location_schedules_location_id ON clinic_location_schedules(location_id);
CREATE INDEX IF NOT EXISTS idx_clinic_location_schedules_clinic_id ON clinic_location_schedules(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_location_schedules_is_active ON clinic_location_schedules(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_location_schedules_effective_from ON clinic_location_schedules(effective_from);
CREATE INDEX IF NOT EXISTS idx_clinic_location_schedules_effective_to ON clinic_location_schedules(effective_to); 