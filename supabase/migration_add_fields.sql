-- Migration: Add new fields to applications table for CBZ Merchant Gateway
-- Run this in your Supabase SQL Editor

-- Add new columns
ALTER TABLE public.applications 
ADD COLUMN IF NOT EXISTS nature_of_business text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS id_number text,
ADD COLUMN IF NOT EXISTS service_types text[] DEFAULT '{}';

-- Update existing applications to have empty arrays for service_types
UPDATE public.applications SET service_types = '{}' WHERE service_types IS NULL;

-- ============================================
-- Create Admin User (excellentadmin@gmail.com)
-- ============================================
-- NOTE: You must create this user via Supabase Auth first.
-- Go to Supabase Dashboard > Authentication > Users > Add User
-- Email: excellentadmin@gmail.com
-- Password: excellent123
-- Auto Confirm: ON
--
-- After creating the user, run the following SQL to assign the admin role.
-- Replace 'YOUR_ADMIN_USER_ID' with the actual UUID from the Auth > Users table.
--
-- UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'YOUR_ADMIN_USER_ID';
--
-- If no user_roles row exists yet:
-- INSERT INTO public.user_roles (user_id, role) VALUES ('YOUR_ADMIN_USER_ID', 'admin');
