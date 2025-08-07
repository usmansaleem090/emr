-- Add new fields to patient_medical_history
ALTER TABLE patient_medical_history
  ADD COLUMN allergies TEXT,
  ADD COLUMN chronic_conditions TEXT,
  ADD COLUMN family_history TEXT,
  ADD COLUMN current_medications TEXT,
  ADD COLUMN previous_surgeries TEXT;

-- Add new fields to patient_surgical_history
ALTER TABLE patient_surgical_history
  ADD COLUMN surgery_type TEXT,
  ADD COLUMN surgeon TEXT,
  ADD COLUMN hospital TEXT,
  ADD COLUMN complications TEXT,
  ADD COLUMN outcome TEXT;

-- Add new fields to patient_diagnostics
ALTER TABLE patient_diagnostics
  ADD COLUMN lab TEXT,
  ADD COLUMN interpretation TEXT,
  ADD COLUMN impression TEXT;
