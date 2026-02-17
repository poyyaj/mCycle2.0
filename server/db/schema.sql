-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK(role IN ('user','admin')),
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Cycle records
CREATE TABLE IF NOT EXISTS cycles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  start_date DATE NOT NULL,
  end_date DATE,
  cycle_length INTEGER,
  bleeding_duration INTEGER,
  predicted_next DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Health metrics snapshots
CREATE TABLE IF NOT EXISTS health_metrics (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  recorded_date DATE NOT NULL,
  weight_kg REAL,
  height_cm REAL,
  waist_cm REAL,
  hip_cm REAL,
  wrist_cm REAL,
  bmi REAL,
  waist_hip_ratio REAL,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Daily symptom logs
CREATE TABLE IF NOT EXISTS daily_logs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id),
  log_date DATE NOT NULL,
  mood TEXT,
  acne_level INTEGER CHECK(acne_level BETWEEN 0 AND 5),
  hair_growth_level INTEGER CHECK(hair_growth_level BETWEEN 0 AND 5),
  pain_level INTEGER CHECK(pain_level BETWEEN 0 AND 10),
  medication TEXT,
  exercise_minutes INTEGER,
  exercise_type TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);
