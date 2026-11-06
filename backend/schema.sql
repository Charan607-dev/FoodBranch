-- ==============================================================================
-- FoodBridge: PostgreSQL Database Schema & Migrations
-- Compatible with Render PostgreSQL, standard PostgreSQL 14+, and Supabase
-- ==============================================================================

-- 1. USERS TABLE (Authentication credentials & core identity)
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(64) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. PROFILES TABLE (Location-aware user profiles)
CREATE TABLE IF NOT EXISTS profiles (
  id VARCHAR(64) PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer')),
  organization_name VARCHAR(255),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Bengaluru',
  latitude DOUBLE PRECISION DEFAULT 12.9716,
  longitude DOUBLE PRECISION DEFAULT 77.5946,
  share_location BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. NGO INFORMATION TABLE (Extended NGO capabilities and verification)
CREATE TABLE IF NOT EXISTS ngo_information (
  id VARCHAR(64) PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  org_name VARCHAR(255) NOT NULL,
  reg_number VARCHAR(100),
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  email VARCHAR(255),
  address TEXT,
  city VARCHAR(100) DEFAULT 'Bengaluru',
  latitude DOUBLE PRECISION DEFAULT 12.9620,
  longitude DOUBLE PRECISION DEFAULT 77.6145,
  daily_meal_capacity INTEGER DEFAULT 150,
  has_cold_storage BOOLEAN DEFAULT TRUE,
  service_areas TEXT DEFAULT 'Indiranagar, Koramangala, Austin Town, Richmond Town',
  is_verified BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. FOOD DONATIONS TABLE (Full lifecycle with exact spatial coordinates)
CREATE TABLE IF NOT EXISTS food_donations (
  id VARCHAR(64) PRIMARY KEY,
  donor_id VARCHAR(64) NOT NULL REFERENCES profiles(id),
  donor_name VARCHAR(255) NOT NULL,
  donor_phone VARCHAR(50) NOT NULL,
  donor_org VARCHAR(255),
  food_name VARCHAR(255) NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('Cooked Food', 'Packaged Food', 'Fruits', 'Vegetables', 'Bakery', 'Other')),
  quantity VARCHAR(100) NOT NULL,
  people_served INTEGER NOT NULL DEFAULT 10,
  preparation_time VARCHAR(100) NOT NULL,
  safe_until VARCHAR(100) NOT NULL,
  pickup_address TEXT NOT NULL,
  pickup_latitude DOUBLE PRECISION NOT NULL DEFAULT 12.9716,
  pickup_longitude DOUBLE PRECISION NOT NULL DEFAULT 77.5946,
  contact_number VARCHAR(50) NOT NULL,
  additional_instructions TEXT,
  status VARCHAR(50) NOT NULL DEFAULT 'Available' CHECK (
    status IN ('Available', 'NGO Accepted', 'Volunteer Assigned', 'Pickup in Progress', 'Delivered', 'Completed', 'Cancelled')
  ),
  ngo_id VARCHAR(64) REFERENCES profiles(id),
  ngo_name VARCHAR(255),
  ngo_address TEXT,
  ngo_latitude DOUBLE PRECISION,
  ngo_longitude DOUBLE PRECISION,
  volunteer_id VARCHAR(64) REFERENCES profiles(id),
  volunteer_name VARCHAR(255),
  volunteer_phone VARCHAR(50),
  volunteer_latitude DOUBLE PRECISION,
  volunteer_longitude DOUBLE PRECISION,
  volunteer_share_location BOOLEAN DEFAULT FALSE,
  delivery_remarks TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. VOLUNTEER ASSIGNMENTS TABLE (Log of all assignments)
CREATE TABLE IF NOT EXISTS volunteer_assignments (
  id VARCHAR(64) PRIMARY KEY,
  donation_id VARCHAR(64) NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  volunteer_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status VARCHAR(50) NOT NULL DEFAULT 'Assigned',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  pickup_time TIMESTAMPTZ,
  delivery_time TIMESTAMPTZ,
  notes TEXT
);

-- 6. DELIVERY UPDATES TABLE (Real-time breadcrumbs & status transition logs)
CREATE TABLE IF NOT EXISTS delivery_updates (
  id VARCHAR(64) PRIMARY KEY,
  donation_id VARCHAR(64) NOT NULL REFERENCES food_donations(id) ON DELETE CASCADE,
  volunteer_id VARCHAR(64) REFERENCES profiles(id),
  volunteer_name VARCHAR(255),
  status VARCHAR(50) NOT NULL,
  remarks TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NOTIFICATIONS TABLE (Targeted alerts for donors, NGOs, and volunteers)
CREATE TABLE IF NOT EXISTS notifications (
  id VARCHAR(64) PRIMARY KEY,
  user_id VARCHAR(64) NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('donor', 'ngo', 'volunteer')),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  donation_id VARCHAR(64),
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SEARCH, LIFE CYCLE QUERIES & SPATIAL LOOKUPS
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_donations_status ON food_donations(status);
CREATE INDEX IF NOT EXISTS idx_donations_donor_id ON food_donations(donor_id);
CREATE INDEX IF NOT EXISTS idx_donations_ngo_id ON food_donations(ngo_id);
CREATE INDEX IF NOT EXISTS idx_donations_volunteer_id ON food_donations(volunteer_id);
CREATE INDEX IF NOT EXISTS idx_donations_geo ON food_donations(pickup_latitude, pickup_longitude);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_delivery_updates_donation ON delivery_updates(donation_id);

-- ==============================================================================
-- SEED INITIAL DEMO DATA (Idempotent - safe to run multiple times)
-- Password for all seeded demo accounts is: "foodbridge123"
-- Bcrypt hash for "foodbridge123" ($2a$10$wO7vK...):
-- $2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy
-- ==============================================================================

-- 1. Seed Users
INSERT INTO users (id, email, password_hash, role)
VALUES 
  ('donor-priya-01', 'priya@curryhouse.com', '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy', 'donor'),
  ('ngo-rajesh-01', 'rajesh@hopefoundation.org', '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy', 'ngo'),
  ('volunteer-vikram-01', 'vikram.rao@volunteer.org', '$2a$10$rDkLzG1Lp/eK.a/xK8XgK.472w5n8B0F.X6B608n7q4tGv3Y2zDuy', 'volunteer')
ON CONFLICT (id) DO NOTHING;

-- 2. Seed Profiles
INSERT INTO profiles (id, full_name, email, phone, role, organization_name, address, city, latitude, longitude, share_location)
VALUES
  ('donor-priya-01', 'Chef Priya Sharma', 'priya@curryhouse.com', '+91 98450 12345', 'donor', 'The Curry House Restaurant', '100ft Road, Indiranagar, Bengaluru', 'Bengaluru', 12.9784, 77.6408, FALSE),
  ('ngo-rajesh-01', 'Rajesh Nair', 'rajesh@hopefoundation.org', '+91 98860 67890', 'ngo', 'Hope Community Care Foundation', 'Austin Town, Near Community Center, Bengaluru', 'Bengaluru', 12.9620, 77.6145, FALSE),
  ('volunteer-vikram-01', 'Vikram Rao', 'vikram.rao@volunteer.org', '+91 97410 54321', 'volunteer', 'FoodBridge City Volunteer Corps', 'Koramangala 4th Block, Bengaluru', 'Bengaluru', 12.9345, 77.6265, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 3. Seed NGO Information
INSERT INTO ngo_information (id, org_name, reg_number, contact_person, phone, email, address, city, latitude, longitude, daily_meal_capacity, has_cold_storage, is_verified)
VALUES
  ('ngo-rajesh-01', 'Hope Community Care Foundation', 'NGO-BLR-2019-8834', 'Rajesh Nair', '+91 98860 67890', 'rajesh@hopefoundation.org', 'Austin Town, Near Community Center, Bengaluru', 'Bengaluru', 12.9620, 77.6145, 250, TRUE, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. Seed Food Donations
INSERT INTO food_donations (
  id, donor_id, donor_name, donor_phone, donor_org, food_name, category, quantity, people_served,
  preparation_time, safe_until, pickup_address, pickup_latitude, pickup_longitude, contact_number,
  additional_instructions, status, ngo_id, ngo_name, ngo_address, ngo_latitude, ngo_longitude,
  volunteer_id, volunteer_name, volunteer_phone, volunteer_latitude, volunteer_longitude, volunteer_share_location,
  delivery_remarks
)
VALUES
  (
    'FB-9041', 'donor-priya-01', 'Chef Priya Sharma', '+91 98450 12345', 'The Curry House Restaurant',
    'Vegetable Dum Biryani & Dal Makhani', 'Cooked Food', '35 Portions (12 kg)', 35,
    'Today, 1:30 PM', 'Today, 8:30 PM (4.5h left)', 'The Curry House, 100ft Rd, Indiranagar, Bengaluru',
    12.9784, 77.6408, '+91 98450 12345', 'Packed in food-grade insulated thermal carriers. Please keep level during transit.',
    'Available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL
  ),
  (
    'FB-9205', 'donor-priya-01', 'Chef Priya Sharma', '+91 98450 12345', 'The Curry House Bakery & Cafe',
    'Fresh Baked Sourdough Loaves & Croissants', 'Bakery', '45 Assorted Items', 40,
    'Today, 10:00 AM', 'Tomorrow, 5:00 PM', 'Richmond Circle, Shanthi Nagar, Bengaluru',
    12.9602, 77.5996, '+91 98450 12345', 'Ready in paper bags, dry cargo.',
    'Available', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, FALSE, NULL
  ),
  (
    'FB-8822', 'donor-priya-01', 'Chef Priya Sharma', '+91 98450 12345', 'The Curry House Restaurant',
    'Artisan Whole Wheat Bread & Buns', 'Bakery', '60 Loaves & Rolls', 50,
    'Today, 11:00 AM', 'Tomorrow, 6:00 PM', 'Domlur Intermediate Ring Rd, Bengaluru',
    12.9609, 77.6387, '+91 98450 12345', NULL,
    'NGO Accepted', 'ngo-rajesh-01', 'Hope Community Care Foundation', 'Austin Town, Near Community Center, Bengaluru', 12.9620, 77.6145,
    NULL, NULL, NULL, NULL, NULL, FALSE, NULL
  ),
  (
    'FB-7619', 'donor-priya-01', 'Chef Priya Sharma', '+91 98450 12345', 'The Curry House Restaurant',
    'Fresh Cut Seasonal Fruit Salad & Crates', 'Fruits', '25 kg Crate', 60,
    'Today, 12:00 PM', 'Today, 7:00 PM', 'MG Road Metro Station Area, Bengaluru',
    12.9753, 77.6066, '+91 98450 12345', NULL,
    'Volunteer Assigned', 'ngo-rajesh-01', 'Hope Community Care Foundation', 'Austin Town, Near Community Center, Bengaluru', 12.9620, 77.6145,
    'volunteer-vikram-01', 'Vikram Rao', '+91 97410 54321', 12.9345, 77.6265, TRUE, NULL
  ),
  (
    'FB-6502', 'donor-priya-01', 'Chef Priya Sharma', '+91 98450 12345', 'The Curry House Restaurant',
    'Pulao & Mixed Veg Curry', 'Cooked Food', '40 Portions', 40,
    'Yesterday, 7:00 PM', 'Delivered Fresh', 'Koramangala 5th Block, Bengaluru',
    12.9352, 77.6245, '+91 98450 12345', NULL,
    'Completed', 'ngo-rajesh-01', 'Hope Community Care Foundation', 'Austin Town, Bengaluru', 12.9620, 77.6145,
    'volunteer-vikram-01', 'Vikram Rao', '+91 97410 54321', 12.9345, 77.6265, TRUE,
    'Received with temperature check intact (68°C). Served to 40 children.'
  )
ON CONFLICT (id) DO NOTHING;

-- 5. Seed Notifications
INSERT INTO notifications (id, user_id, role, title, message, donation_id, is_read)
VALUES
  ('notif-seed-1', 'donor-priya-01', 'donor', 'Donation Accepted!', 'Hope Community Care Foundation accepted your donation of Artisan Bread (FB-8822).', 'FB-8822', FALSE),
  ('notif-seed-2', 'ngo-rajesh-01', 'ngo', 'New Donation Available', 'The Curry House just published 35 portions of Vegetable Dum Biryani (FB-9041).', 'FB-9041', FALSE),
  ('notif-seed-3', 'volunteer-vikram-01', 'volunteer', 'New Pickup Task Available', 'Artisan Bread (FB-8822) is ready for pickup in Indiranagar for delivery to Austin Town.', 'FB-8822', FALSE)
ON CONFLICT (id) DO NOTHING;
