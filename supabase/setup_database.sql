-- CBZ Merchant Gateway - Database Initialization Script
-- Run this in the Supabase SQL Editor

-- 1. Create custom enums
CREATE TYPE public.app_role AS ENUM (
  'merchant',
  'onboarding_officer',
  'compliance_officer',
  'admin'
);

CREATE TYPE public.application_status AS ENUM (
  'draft',
  'submitted',
  'under_review',
  'compliance_review',
  'approved',
  'rejected',
  'additional_documents_requested'
);

-- 2. Create profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  email text NOT NULL,
  name text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 3. Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL DEFAULT 'merchant',
  UNIQUE(user_id, role)
);

-- 4. Create applications table
CREATE TABLE public.applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  business_name text NOT NULL,
  trading_name text,
  business_type text NOT NULL,
  registration_number text NOT NULL,
  tax_id text,
  business_address text NOT NULL,
  city text NOT NULL,
  province text,
  country text NOT NULL DEFAULT 'Zimbabwe',
  postal_code text,
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text NOT NULL,
  website_url text,
  business_description text,
  expected_monthly_volume text,
  status public.application_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by uuid REFERENCES auth.users(id),
  compliance_reviewed_at timestamptz,
  compliance_reviewed_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- 5. Create documents table
CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  type text NOT NULL,
  file_path text NOT NULL,
  file_size bigint,
  uploaded_at timestamptz DEFAULT now() NOT NULL
);

-- 6. Create comments table
CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid REFERENCES public.applications(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  is_internal boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 7. Functions
CREATE OR REPLACE FUNCTION public.has_role(_role public.app_role, _user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.is_bank_staff(_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('onboarding_officer', 'compliance_officer', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 8. Trigger function for new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'name', NEW.email)
  );

  INSERT INTO public.user_roles (user_id, role)
  VALUES (
    NEW.id,
    COALESCE((NEW.raw_user_meta_data ->> 'role')::public.app_role, 'merchant'::public.app_role)
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 9. Create the trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 10. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- 11. Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bank staff can view all profiles"
  ON public.profiles FOR SELECT USING (public.is_bank_staff(auth.uid()));

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- 12. Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bank staff can view all roles"
  ON public.user_roles FOR SELECT USING (public.is_bank_staff(auth.uid()));

-- 13. Policies for applications
CREATE POLICY "Merchants can view their own applications"
  ON public.applications FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Bank staff can view all applications"
  ON public.applications FOR SELECT USING (public.is_bank_staff(auth.uid()));

CREATE POLICY "Merchants can create applications"
  ON public.applications FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Merchants can update their own applications"
  ON public.applications FOR UPDATE USING (
    auth.uid() = user_id AND (status = 'draft' OR status = 'submitted')
  ) WITH CHECK (
    auth.uid() = user_id AND status IN ('draft', 'submitted')
  );

CREATE POLICY "Bank staff can update application status"
  ON public.applications FOR UPDATE USING (public.is_bank_staff(auth.uid()));

-- 14. Policies for documents
CREATE POLICY "Users can view documents of their own applications"
  ON public.documents FOR SELECT USING (
    auth.uid() = user_id OR public.is_bank_staff(auth.uid())
  );

CREATE POLICY "Users can upload documents to their own applications"
  ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 15. Policies for comments
CREATE POLICY "Users can view comments on their applications"
  ON public.comments FOR SELECT USING (
    (auth.uid() = user_id AND is_internal = false) OR public.is_bank_staff(auth.uid())
  );

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
