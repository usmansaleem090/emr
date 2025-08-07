-- Create insurance_providers table
CREATE TABLE IF NOT EXISTS insurance_providers (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create clinic_insurances table
CREATE TABLE IF NOT EXISTS clinic_insurances (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    insurance_id INTEGER NOT NULL REFERENCES insurance_providers(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_clinic_insurances_clinic_id ON clinic_insurances(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_insurances_insurance_id ON clinic_insurances(insurance_id);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_name ON insurance_providers(name);
CREATE INDEX IF NOT EXISTS idx_insurance_providers_active ON insurance_providers(is_active);

-- Insert default insurance providers
INSERT INTO insurance_providers (name, description, is_active, created_at, updated_at) VALUES
('Blue Cross Blue Shield', 'Blue Cross Blue Shield Association', true, NOW(), NOW()),
('Aetna', 'Aetna Inc.', true, NOW(), NOW()),
('Medicaid', 'State Medicaid programs', true, NOW(), NOW()),
('Medicare', 'Federal Medicare program', true, NOW(), NOW()),
('Tricare', 'Military health care program', true, NOW(), NOW()),
('Cigna', 'Cigna Corporation', true, NOW(), NOW()),
('United Healthcare', 'UnitedHealth Group', true, NOW(), NOW()),
('Humana', 'Humana Inc.', true, NOW(), NOW()),
('Kaiser Permanente', 'Kaiser Permanente', true, NOW(), NOW()),
('Anthem', 'Anthem Inc.', true, NOW(), NOW()),
('Molina Healthcare', 'Molina Healthcare Inc.', true, NOW(), NOW()),
('WellCare', 'WellCare Health Plans', true, NOW(), NOW()),
('Centene', 'Centene Corporation', true, NOW(), NOW()),
('Independence Blue Cross', 'Independence Blue Cross', true, NOW(), NOW()),
('HealthFirst', 'HealthFirst', true, NOW(), NOW()),
('Oscar Health', 'Oscar Health Inc.', true, NOW(), NOW()),
('Bright Health', 'Bright Health Group', true, NOW(), NOW()),
('Friday Health Plans', 'Friday Health Plans', true, NOW(), NOW())
ON CONFLICT (name) DO NOTHING; 