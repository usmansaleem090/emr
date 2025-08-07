CREATE TABLE patient_prior_visits (
  id SERIAL PRIMARY KEY,
  patient_id INTEGER REFERENCES patients(id),
  date DATE,
  reason TEXT,
  diagnosis TEXT,
  treatment TEXT,
  provider TEXT,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
