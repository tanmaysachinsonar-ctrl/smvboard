-- This script creates the demo user in Supabase Auth
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/rhzthhbfcrdafscmbwpv/sql

-- Insert demo user into auth.users
-- Password: password123
-- Hashed with bcrypt: $2a$10$YourHashHere (Supabase uses different hash format)

-- Note: You CANNOT directly insert into auth.users via SQL
-- Instead, use Supabase Dashboard → Authentication → Users → Add User

-- Manual steps:
-- 1. Go to: https://supabase.com/dashboard/project/rhzthhbfcrdafscmbwpv/auth/users
-- 2. Click "Add User" button
-- 3. Enter:
--    Email: owner@demo-schule.de
--    Password: password123
--    Auto Confirm User: YES (important!)
-- 4. Click "Create User"
-- 5. Copy the generated UUID
-- 6. Update the user in our database:

-- Update user ID in our database to match Supabase Auth ID
-- UPDATE "User" 
-- SET id = 'paste-uuid-from-step-5-here'
-- WHERE email = 'owner@demo-schule.de';
