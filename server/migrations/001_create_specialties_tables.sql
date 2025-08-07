-- Migration: Create specialties tables
-- Date: 2024-01-01
-- Description: Creates medical_specialties and clinic_specialties tables

-- Create medical_specialties table
CREATE TABLE IF NOT EXISTS medical_specialties (
    id SERIAL PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create clinic_specialties table
CREATE TABLE IF NOT EXISTS clinic_specialties (
    id SERIAL PRIMARY KEY,
    clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
    specialty_id INTEGER NOT NULL REFERENCES medical_specialties(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    UNIQUE(clinic_id, specialty_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_medical_specialties_name ON medical_specialties(name);
CREATE INDEX IF NOT EXISTS idx_medical_specialties_active ON medical_specialties(is_active);
CREATE INDEX IF NOT EXISTS idx_clinic_specialties_clinic_id ON clinic_specialties(clinic_id);
CREATE INDEX IF NOT EXISTS idx_clinic_specialties_specialty_id ON clinic_specialties(specialty_id);
CREATE INDEX IF NOT EXISTS idx_clinic_specialties_primary ON clinic_specialties(clinic_id, is_primary);

-- Insert default medical specialties
INSERT INTO medical_specialties (name, description) VALUES
    ('Internal Medicine', 'General internal medicine for adults'),
    ('Family Medicine', 'Comprehensive care for all ages'),
    ('Cardiology', 'Heart and cardiovascular system'),
    ('Neurology', 'Nervous system and brain disorders'),
    ('Pediatrics', 'Medical care for infants, children, and adolescents'),
    ('Orthopedics', 'Bones, joints, and musculoskeletal system'),
    ('Dermatology', 'Skin, hair, and nail conditions'),
    ('Psychiatry', 'Mental health and behavioral disorders'),
    ('Radiology', 'Medical imaging and diagnostic procedures'),
    ('Emergency Medicine', 'Acute care and emergency treatment'),
    ('Anesthesiology', 'Pain management and surgical anesthesia'),
    ('Pathology', 'Disease diagnosis through laboratory analysis'),
    ('Oncology', 'Cancer diagnosis and treatment'),
    ('Endocrinology', 'Hormone and metabolic disorders'),
    ('Gastroenterology', 'Digestive system and gastrointestinal disorders'),
    ('Pulmonology', 'Respiratory system and lung disorders'),
    ('Nephrology', 'Kidney diseases and renal system'),
    ('Rheumatology', 'Autoimmune and inflammatory diseases'),
    ('Infectious Disease', 'Bacterial, viral, and parasitic infections'),
    ('General Surgery', 'Surgical procedures and operations')
ON CONFLICT (name) DO NOTHING; 