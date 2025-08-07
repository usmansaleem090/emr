-- Create user_locations table
CREATE TABLE IF NOT EXISTS user_locations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    location_id INTEGER NOT NULL REFERENCES clinic_locations(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT false,
    assigned_date TIMESTAMP NOT NULL DEFAULT NOW(),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'transferred')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, location_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_locations_user_id ON user_locations(user_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_clinic_id ON user_locations(clinic_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_location_id ON user_locations(location_id);
CREATE INDEX IF NOT EXISTS idx_user_locations_status ON user_locations(status);

-- Add location_id column to doctors table
ALTER TABLE doctors ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES clinic_locations(id) ON DELETE SET NULL;

-- Add location_id column to clinic_staff table
ALTER TABLE clinic_staff ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES clinic_locations(id) ON DELETE SET NULL; 