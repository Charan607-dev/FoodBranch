-- ========================================================
-- FoodBridge: Role-Based & Location-Aware Food Donation Schema
-- Database: PostgreSQL / Supabase
-- ========================================================

-- Enable UUID extension if not enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE (Location-enabled)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer')),
  organization_name TEXT,
  address TEXT,
  city TEXT DEFAULT 'Bengaluru',
  latitude DOUBLE PRECISION DEFAULT 12.9716,
  longitude DOUBLE PRECISION DEFAULT 77.5946,
  share_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure columns exist if updating an existing database
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'city') THEN
    ALTER TABLE public.profiles ADD COLUMN city TEXT DEFAULT 'Bengaluru';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'latitude') THEN
    ALTER TABLE public.profiles ADD COLUMN latitude DOUBLE PRECISION DEFAULT 12.9716;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'longitude') THEN
    ALTER TABLE public.profiles ADD COLUMN longitude DOUBLE PRECISION DEFAULT 77.5946;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'share_location') THEN
    ALTER TABLE public.profiles ADD COLUMN share_location BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- 2. DONATIONS TABLE (Geographical Coordinates & Multi-party Locations)
CREATE TABLE IF NOT EXISTS public.donations (
  id TEXT PRIMARY KEY,
  donor_id UUID NOT NULL REFERENCES public.profiles(id),
  ngo_id UUID REFERENCES public.profiles(id),
  volunteer_id UUID REFERENCES public.profiles(id),
  food_name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('Cooked Food', 'Packaged Food', 'Fruits', 'Vegetables', 'Bakery', 'Other')),
  quantity TEXT NOT NULL,
  people_served INTEGER NOT NULL DEFAULT 10,
  preparation_time TEXT NOT NULL,
  safe_until TEXT NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION NOT NULL DEFAULT 12.9716,
  pickup_longitude DOUBLE PRECISION NOT NULL DEFAULT 77.5946,
  ngo_latitude DOUBLE PRECISION,
  ngo_longitude DOUBLE PRECISION,
  ngo_address TEXT,
  contact_number TEXT NOT NULL,
  additional_instructions TEXT,
  status TEXT NOT NULL DEFAULT 'Available' CHECK (
    status IN ('Available', 'NGO Accepted', 'Volunteer Assigned', 'Pickup in Progress', 'Delivered', 'Completed', 'Cancelled')
  ),
  donor_name TEXT,
  ngo_name TEXT,
  volunteer_name TEXT,
  volunteer_latitude DOUBLE PRECISION,
  volunteer_longitude DOUBLE PRECISION,
  volunteer_share_location BOOLEAN DEFAULT FALSE,
  delivery_remarks TEXT,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Ensure location columns exist if updating existing donations table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'pickup_latitude') THEN
    ALTER TABLE public.donations ADD COLUMN pickup_latitude DOUBLE PRECISION NOT NULL DEFAULT 12.9716;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'pickup_longitude') THEN
    ALTER TABLE public.donations ADD COLUMN pickup_longitude DOUBLE PRECISION NOT NULL DEFAULT 77.5946;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'ngo_latitude') THEN
    ALTER TABLE public.donations ADD COLUMN ngo_latitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'ngo_longitude') THEN
    ALTER TABLE public.donations ADD COLUMN ngo_longitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'ngo_address') THEN
    ALTER TABLE public.donations ADD COLUMN ngo_address TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'volunteer_latitude') THEN
    ALTER TABLE public.donations ADD COLUMN volunteer_latitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'volunteer_longitude') THEN
    ALTER TABLE public.donations ADD COLUMN volunteer_longitude DOUBLE PRECISION;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'volunteer_share_location') THEN
    ALTER TABLE public.donations ADD COLUMN volunteer_share_location BOOLEAN DEFAULT FALSE;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'donations' AND column_name = 'delivery_remarks') THEN
    ALTER TABLE public.donations ADD COLUMN delivery_remarks TEXT;
  END IF;
END $$;

-- Geographical and status indexes for fast spatial bounding/proximity and lifecycle queries
CREATE INDEX IF NOT EXISTS idx_donations_status ON public.donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_pickup_geo ON public.donations(pickup_latitude, pickup_longitude);
CREATE INDEX IF NOT EXISTS idx_profiles_role_geo ON public.profiles(role, latitude, longitude);

-- 3. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  donation_id TEXT,
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. DELIVERY UPDATES TABLE
CREATE TABLE IF NOT EXISTS public.delivery_updates (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  donation_id TEXT NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  volunteer_id UUID REFERENCES public.profiles(id),
  status TEXT NOT NULL,
  remarks TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- ========================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_updates ENABLE ROW LEVEL SECURITY;

-- Drop prior policies to avoid conflicts if re-running migration
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Authenticated users can view donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can insert donations" ON public.donations;
DROP POLICY IF EXISTS "Donors can update their own unaccepted donations" ON public.donations;
DROP POLICY IF EXISTS "Users can view and update their own notifications" ON public.notifications;

-- PROFILES POLICIES
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- DONATIONS POLICIES
CREATE POLICY "Authenticated users can view donations"
  ON public.donations FOR SELECT
  TO authenticated
  USING (
    status = 'Available'
    OR donor_id = auth.uid()
    OR ngo_id = auth.uid()
    OR volunteer_id = auth.uid()
    OR (status = 'NGO Accepted' AND (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'volunteer')
  );

CREATE POLICY "Donors can insert donations"
  ON public.donations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = donor_id);

CREATE POLICY "Donors can update their own unaccepted donations"
  ON public.donations FOR UPDATE
  TO authenticated
  USING (auth.uid() = donor_id AND status = 'Available');

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view and update their own notifications"
  ON public.notifications FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- ========================================================
-- ATOMIC STORED PROCEDURES (CONCURRENT SAFETY & GEOGRAPHIC SYNC)
-- ========================================================

-- Atomic NGO Acceptance with Destination Coordinates
CREATE OR REPLACE FUNCTION accept_donation(
  p_donation_id TEXT,
  p_ngo_id UUID,
  p_ngo_name TEXT,
  p_ngo_address TEXT DEFAULT NULL,
  p_ngo_latitude DOUBLE PRECISION DEFAULT NULL,
  p_ngo_longitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated INTEGER;
  v_donor_id UUID;
  v_food_name TEXT;
BEGIN
  -- Lock the row and verify status is Available
  UPDATE public.donations
  SET 
    ngo_id = p_ngo_id,
    ngo_name = p_ngo_name,
    ngo_address = COALESCE(p_ngo_address, ngo_address),
    ngo_latitude = p_ngo_latitude,
    ngo_longitude = p_ngo_longitude,
    status = 'NGO Accepted',
    updated_at = NOW()
  WHERE id = p_donation_id AND status = 'Available' AND ngo_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN FALSE;
  END IF;

  -- Notify the donor
  SELECT donor_id, food_name INTO v_donor_id, v_food_name FROM public.donations WHERE id = p_donation_id;
  INSERT INTO public.notifications (user_id, role, title, message, donation_id)
  VALUES (
    v_donor_id,
    'donor',
    'Donation Accepted by NGO!',
    p_ngo_name || ' has accepted your donation of ' || v_food_name || '. Route matching is now open to nearby volunteer couriers.',
    p_donation_id
  );

  RETURN TRUE;
END;
$$;

-- Atomic Volunteer Assignment with Pickup Safety
CREATE OR REPLACE FUNCTION assign_volunteer(
  p_donation_id TEXT,
  p_volunteer_id UUID,
  p_volunteer_name TEXT,
  p_volunteer_phone TEXT DEFAULT NULL,
  p_volunteer_latitude DOUBLE PRECISION DEFAULT NULL,
  p_volunteer_longitude DOUBLE PRECISION DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_updated INTEGER;
  v_donor_id UUID;
  v_ngo_id UUID;
  v_food_name TEXT;
BEGIN
  UPDATE public.donations
  SET 
    volunteer_id = p_volunteer_id,
    volunteer_name = p_volunteer_name,
    volunteer_phone = COALESCE(p_volunteer_phone, volunteer_phone),
    volunteer_latitude = p_volunteer_latitude,
    volunteer_longitude = p_volunteer_longitude,
    status = 'Volunteer Assigned',
    updated_at = NOW()
  WHERE id = p_donation_id AND status = 'NGO Accepted' AND volunteer_id IS NULL;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  IF v_updated = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT donor_id, ngo_id, food_name INTO v_donor_id, v_ngo_id, v_food_name FROM public.donations WHERE id = p_donation_id;

  -- Notify Donor
  INSERT INTO public.notifications (user_id, role, title, message, donation_id)
  VALUES (
    v_donor_id,
    'donor',
    'Volunteer Assigned for Pickup',
    p_volunteer_name || ' will collect your donation of ' || v_food_name || ' shortly.',
    p_donation_id
  );

  -- Notify NGO
  INSERT INTO public.notifications (user_id, role, title, message, donation_id)
  VALUES (
    v_ngo_id,
    'ngo',
    'Courier En Route to Collect Food',
    p_volunteer_name || ' has taken the pickup task for ' || v_food_name || '.',
    p_donation_id
  );

  RETURN TRUE;
END;
$$;
