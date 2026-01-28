-- ============================================
-- DENTTRACK SUPABASE DATABASE SCHEMA
-- Migration: Initial schema
-- ============================================

-- ============================================
-- DENTISTS TABLE (must be created first - referenced by treatments)
-- ============================================
CREATE TABLE IF NOT EXISTS dentists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  clinic_name TEXT,
  type TEXT, -- General Dentist, Oral Surgeon, Endodontist, etc.
  phone TEXT,
  notes TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_dentists_user_id ON dentists(user_id);

-- ============================================
-- TREATMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tooth_id INTEGER, -- NULL for general procedures like hygiene
  type TEXT NOT NULL,
  date DATE NOT NULL,
  notes TEXT,
  cost DECIMAL(10, 2),
  currency TEXT DEFAULT 'USD',
  attachments JSONB DEFAULT '[]'::jsonb,
  dentist_id UUID REFERENCES dentists(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_treatments_user_id ON treatments(user_id);
CREATE INDEX IF NOT EXISTS idx_treatments_date ON treatments(user_id, date DESC);

-- ============================================
-- TEETH STATUS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS teeth_status (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tooth_id INTEGER NOT NULL, -- FDI number (11-48)
  status TEXT NOT NULL, -- Healthy, Filled, Crown, etc.
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, tooth_id)
);

CREATE INDEX IF NOT EXISTS idx_teeth_status_user_id ON teeth_status(user_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
ALTER TABLE treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE dentists ENABLE ROW LEVEL SECURITY;
ALTER TABLE teeth_status ENABLE ROW LEVEL SECURITY;

-- Dentists policies
CREATE POLICY "Users can view their own dentists"
  ON dentists FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own dentists"
  ON dentists FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dentists"
  ON dentists FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dentists"
  ON dentists FOR DELETE
  USING (auth.uid() = user_id);

-- Treatments policies
CREATE POLICY "Users can view their own treatments"
  ON treatments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own treatments"
  ON treatments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own treatments"
  ON treatments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own treatments"
  ON treatments FOR DELETE
  USING (auth.uid() = user_id);

-- Teeth status policies
CREATE POLICY "Users can view their own teeth status"
  ON teeth_status FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own teeth status"
  ON teeth_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own teeth status"
  ON teeth_status FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own teeth status"
  ON teeth_status FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- UPDATED_AT TRIGGER
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_dentists_updated_at
  BEFORE UPDATE ON dentists
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_treatments_updated_at
  BEFORE UPDATE ON treatments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teeth_status_updated_at
  BEFORE UPDATE ON teeth_status
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
