-- ============================================================================
-- SMILE DENTAL CLINIC - COMPREHENSIVE SUPABASE DATABASE SCHEMA SETUP
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. EXTENSIONS & GENERAL TYPES
-- ----------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Role-based access control roles & enums
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'doctor');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'appointment_status') THEN
    CREATE TYPE public.appointment_status AS ENUM ('pending', 'approved', 'completed', 'cancelled', 'no_show');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'treatment_status') THEN
    CREATE TYPE public.treatment_status AS ENUM ('planned', 'in_progress', 'completed', 'cancelled');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'message_status') THEN
    CREATE TYPE public.message_status AS ENUM ('new', 'read', 'archived');
  END IF;
END
$$;

-- ----------------------------------------------------------------------------
-- 2. CLINIC CORE DATA TABLES
-- ----------------------------------------------------------------------------

-- User Profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User Roles
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Doctors Table
CREATE TABLE IF NOT EXISTS public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT,
  specialty TEXT,
  qualifications TEXT,
  experience TEXT,
  bio TEXT,
  email TEXT,
  phone TEXT,
  photo_url TEXT,
  color_code TEXT NOT NULL DEFAULT '#3b82f6',
  consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
  specialties TEXT[] DEFAULT '{}',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Testimonials Table
CREATE TABLE IF NOT EXISTS public.testimonials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT,
  treatment TEXT,
  quote TEXT NOT NULL,
  rating INT NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image_key TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Services / Categories Table
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL UNIQUE,
  tagline TEXT,
  summary TEXT,
  icon TEXT,            -- Lucide icon name, e.g., "Stethoscope"
  image_key TEXT,       -- Resolution key for local asset registry
  doctor_name TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Service Articles Table (Slug-specific detail content pages)
CREATE TABLE IF NOT EXISTS public.service_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  short_description TEXT,
  meta_title TEXT,
  meta_description TEXT,
  hero_image_key TEXT,
  lead TEXT,
  body JSONB NOT NULL DEFAULT '[]'::jsonb,
  gallery JSONB NOT NULL DEFAULT '[]'::jsonb,
  cta_service TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 3. PATIENTS CRM & SHIFT MANAGEMENT
-- ----------------------------------------------------------------------------

-- Patients Profiles CRM Table
CREATE TABLE IF NOT EXISTS public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  dob DATE,
  gender TEXT,
  address TEXT,
  insurance_provider TEXT,
  insurance_number TEXT,
  medical_notes TEXT,
  notes TEXT,           -- Receptionist/admin general notes
  primary_doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  primary_service TEXT, -- Service category name
  tags TEXT[] DEFAULT '{}', -- VIP, Anxious, Heart Patient, etc.
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Patient Family Linking Table
CREATE TABLE IF NOT EXISTS public.patient_family_links (
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  relative_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  relationship TEXT NOT NULL, -- Parent, Child, Spouse, Sibling
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (patient_id, relative_id)
);

-- Doctor Shifts
CREATE TABLE IF NOT EXISTS public.doctor_shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID NOT NULL REFERENCES public.doctors(id) ON DELETE CASCADE,
  shift_date DATE NOT NULL,
  shift_start TIME NOT NULL,
  shift_end TIME NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Doctor Calendar Blockings (Vacations, Lunch Breaks, Holiday, Emergency closure)
CREATE TABLE IF NOT EXISTS public.calendar_blockings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE, -- Null means clinic-wide off-day
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  block_type TEXT NOT NULL CHECK (block_type IN ('lunch_break', 'weekly_off', 'holiday', 'vacation', 'emergency_closure', 'other')),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 4. APPOINTMENT MANAGEMENT
-- ----------------------------------------------------------------------------

-- Appointments Table
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  -- Snapshot metadata (ideal for online widget/unregistered walk-ins)
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  doctor_name TEXT,
  service TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL DEFAULT 30,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  booking_channel TEXT NOT NULL DEFAULT 'manual' CHECK (booking_channel IN ('manual', 'online', 'ai', 'walk_in', 'emergency')),
  room_chair TEXT, -- Chair number/Room allocation
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Appointment Services Table (Supporting Multi-Treatment Bookings)
CREATE TABLE IF NOT EXISTS public.appointment_services (
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_title TEXT NOT NULL,
  PRIMARY KEY (appointment_id, service_title)
);

-- ----------------------------------------------------------------------------
-- 5. CLINICAL RECORDS & TOOTH CHART
-- ----------------------------------------------------------------------------

-- Patient Clinical Notes & Records
CREATE TABLE IF NOT EXISTS public.clinical_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  diagnosis TEXT,
  procedure_notes TEXT,
  tooth_chart_data JSONB DEFAULT '{}'::jsonb, -- Tooth numbers and conditions (e.g. decayed, root_canal, crown)
  clinical_notes TEXT,
  voice_note_url TEXT,                        -- URL/path to raw voice recording (voice-to-note)
  follow_up_recommendations TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Clinical Files (X-Rays, Before/After Photos)
CREATE TABLE IF NOT EXISTS public.clinical_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES public.clinical_records(id) ON DELETE CASCADE,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_url TEXT NOT NULL,
  file_name TEXT,
  file_type TEXT NOT NULL CHECK (file_type IN ('x_ray', 'photo_before', 'photo_after', 'progress', 'other')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS public.prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_id UUID REFERENCES public.clinical_records(id) ON DELETE CASCADE,
  medicine_name TEXT NOT NULL,
  dosage TEXT NOT NULL,            -- e.g. "500mg"
  frequency TEXT NOT NULL,         -- e.g. "1-0-1 (twice daily)"
  duration TEXT NOT NULL,          -- e.g. "5 Days"
  instructions TEXT,               -- e.g. "Take after meals"
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 6. BILLING & PAYMENTS
-- ----------------------------------------------------------------------------

-- Invoices Table
CREATE TABLE IF NOT EXISTS public.billing_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL UNIQUE,
  total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  tax_rate DECIMAL(5, 2) DEFAULT 18.00, -- GST/VAT (default 18%)
  tax_amount DECIMAL(10, 2) DEFAULT 0.00,
  final_amount DECIMAL(10, 2) NOT NULL DEFAULT 0.00, -- Total after discount + tax
  paid_amount DECIMAL(10, 2) DEFAULT 0.00,
  due_amount DECIMAL(10, 2) GENERATED ALWAYS AS (final_amount - paid_amount) STORED,
  status TEXT NOT NULL DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'partial', 'paid', 'refunded')),
  pdf_url TEXT,
  due_date DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Payment Transactions
CREATE TABLE IF NOT EXISTS public.payment_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.billing_invoices(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL,
  payment_method TEXT NOT NULL CHECK (payment_method IN ('cash', 'upi', 'credit_card', 'debit_card', 'bank_transfer', 'wallet')),
  transaction_ref TEXT, -- UPI UTR, Card transaction ID, etc.
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 7. RECEPTIONIST, STAFF & INVENTORY MANAGEMENT
-- ----------------------------------------------------------------------------

-- Staff Registry
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('receptionist', 'staff', 'assistant', 'clinic_manager')),
  phone TEXT,
  email TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Staff Attendance Tracking
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  check_in TIMESTAMPTZ NOT NULL,
  check_out TIMESTAMPTZ,
  attendance_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Dental Inventory & Medicine Tracking
CREATE TABLE IF NOT EXISTS public.inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  item_type TEXT NOT NULL CHECK (item_type IN ('material', 'medicine', 'equipment')),
  stock_qty INT NOT NULL DEFAULT 0,
  min_stock_alert INT NOT NULL DEFAULT 5, -- Triggers low stock alert
  vendor_name TEXT,
  vendor_contact TEXT,
  purchase_price DECIMAL(10, 2),
  purchase_date DATE,
  expiry_date DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 8. COMMUNICATIONS & SETTINGS
-- ----------------------------------------------------------------------------

-- Email & SMS/WhatsApp Notification Log
CREATE TABLE IF NOT EXISTS public.notification_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email', 'sms', 'whatsapp')),
  template_type TEXT NOT NULL CHECK (template_type IN ('booking_confirmation', 'appointment_reminder', 'cancellation_alert', 'follow_up_reminder', 'invoice_email', 'promotional_campaign')),
  recipient TEXT NOT NULL, -- Phone number or email
  sent_status TEXT DEFAULT 'pending' CHECK (sent_status IN ('pending', 'sent', 'failed')),
  sent_at TIMESTAMPTZ
);

-- Clinic Settings (Branding, Setup, Tax settings)
CREATE TABLE IF NOT EXISTS public.clinic_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  description TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Contact Messages
CREATE TABLE IF NOT EXISTS public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Treatment Plans
CREATE TABLE IF NOT EXISTS public.treatment_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  appointment_id UUID REFERENCES public.appointments(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.treatment_status NOT NULL DEFAULT 'planned',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Treatment Documents
CREATE TABLE IF NOT EXISTS public.treatment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.treatment_plans(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Admin Users Registry
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Website Content CMS
CREATE TABLE IF NOT EXISTS public.website_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  section_key TEXT UNIQUE NOT NULL,
  title TEXT,
  content JSONB,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- ----------------------------------------------------------------------------
-- 9. INDEXES
-- ----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_patients_phone ON public.patients(phone);
CREATE INDEX IF NOT EXISTS idx_appts_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX IF NOT EXISTS idx_appts_status ON public.appointments(status);
CREATE INDEX IF NOT EXISTS idx_appts_reference ON public.appointments(reference_id);
CREATE INDEX IF NOT EXISTS idx_articles_category ON public.service_articles(category);

-- ----------------------------------------------------------------------------
-- 10. FUNCTIONS, TRIGGERS & RLS CONFIGURATION
-- ----------------------------------------------------------------------------

-- Set updated_at trigger helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- Helper security functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_staff(_user_id UUID)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role IN ('admin','staff','doctor')
  );
$$;

-- Get Booked Slots function
CREATE OR REPLACE FUNCTION public.get_booked_slots(_from TIMESTAMPTZ, _to TIMESTAMPTZ)
RETURNS TABLE(scheduled_at TIMESTAMPTZ, doctor_name TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT scheduled_at, doctor_name
  FROM public.appointments
  WHERE status <> 'cancelled' AND scheduled_at >= _from AND scheduled_at < _to;
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email));
  RETURN NEW;
END;
$$;

-- Enable trigger bindings
DROP TRIGGER IF EXISTS trg_profiles_updated ON public.profiles;
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_doctors_updated ON public.doctors;
CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_testimonials_updated ON public.testimonials;
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_services_updated ON public.services;
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_articles_updated ON public.service_articles;
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.service_articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_patients_updated ON public.patients;
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_appts_updated ON public.appointments;
CREATE TRIGGER trg_appts_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_plans_updated ON public.treatment_plans;
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.treatment_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_billing_invoices_updated ON public.billing_invoices;
CREATE TRIGGER trg_billing_invoices_updated BEFORE UPDATE ON public.billing_invoices FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_clinic_settings_updated ON public.clinic_settings;
CREATE TRIGGER trg_clinic_settings_updated BEFORE UPDATE ON public.clinic_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Enable RLS Enforcement
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_family_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctor_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calendar_blockings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinical_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clinic_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_content ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- 11. RLS POLICY DEFINITIONS
-- ----------------------------------------------------------------------------

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- User Roles policies
DROP POLICY IF EXISTS "roles_select_staff" ON public.user_roles;
CREATE POLICY "roles_select_staff" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "roles_admin_all" ON public.user_roles;
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Doctors policies
DROP POLICY IF EXISTS "doctors_public_read" ON public.doctors;
CREATE POLICY "doctors_public_read" ON public.doctors FOR SELECT USING (active = true);
DROP POLICY IF EXISTS "doctors_staff_all" ON public.doctors;
CREATE POLICY "doctors_staff_all" ON public.doctors FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Testimonials policies
DROP POLICY IF EXISTS "testimonials_public_read" ON public.testimonials;
CREATE POLICY "testimonials_public_read" ON public.testimonials FOR SELECT TO public USING (active = true);
DROP POLICY IF EXISTS "testimonials_staff_all" ON public.testimonials;
CREATE POLICY "testimonials_staff_all" ON public.testimonials FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Services policies
DROP POLICY IF EXISTS "services_public_read" ON public.services;
CREATE POLICY "services_public_read" ON public.services FOR SELECT TO public USING (active = true);
DROP POLICY IF EXISTS "services_staff_all" ON public.services;
CREATE POLICY "services_staff_all" ON public.services FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Service Articles policies
DROP POLICY IF EXISTS "articles_public_read" ON public.service_articles;
CREATE POLICY "articles_public_read" ON public.service_articles FOR SELECT TO public USING (active = true);
DROP POLICY IF EXISTS "articles_staff_all" ON public.service_articles;
CREATE POLICY "articles_staff_all" ON public.service_articles FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Patients policies
DROP POLICY IF EXISTS "patients_staff_all" ON public.patients;
CREATE POLICY "patients_staff_all" ON public.patients FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Patient Family Links policies
DROP POLICY IF EXISTS "family_staff_all" ON public.patient_family_links;
CREATE POLICY "family_staff_all" ON public.patient_family_links FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Doctor Shifts policies
DROP POLICY IF EXISTS "shifts_public_read" ON public.doctor_shifts;
CREATE POLICY "shifts_public_read" ON public.doctor_shifts FOR SELECT TO public USING (is_active = true);
DROP POLICY IF EXISTS "shifts_staff_all" ON public.doctor_shifts;
CREATE POLICY "shifts_staff_all" ON public.doctor_shifts FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Calendar Blockings policies
DROP POLICY IF EXISTS "calendar_blocks_public_read" ON public.calendar_blockings;
CREATE POLICY "calendar_blocks_public_read" ON public.calendar_blockings FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "calendar_blocks_staff_all" ON public.calendar_blockings;
CREATE POLICY "calendar_blocks_staff_all" ON public.calendar_blockings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Appointments policies
DROP POLICY IF EXISTS "appts_public_insert" ON public.appointments;
CREATE POLICY "appts_public_insert" ON public.appointments
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    status = 'pending'
    AND doctor_id IS NULL
    AND patient_id IS NULL
    AND created_by IS NULL
    AND length(patient_name) BETWEEN 2 AND 120
    AND length(patient_phone) BETWEEN 6 AND 20
    AND length(service) BETWEEN 1 AND 200
    AND (notes IS NULL OR length(notes) <= 1000)
    AND scheduled_at > now()
    AND scheduled_at < (now() + interval '180 days')
  );

DROP POLICY IF EXISTS "appts_public_select_slots" ON public.appointments;
CREATE POLICY "appts_public_select_slots" ON public.appointments FOR SELECT USING (status <> 'cancelled');

DROP POLICY IF EXISTS "appts_staff_all" ON public.appointments;
CREATE POLICY "appts_staff_all" ON public.appointments FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Appointment Services policies
DROP POLICY IF EXISTS "appt_svc_staff_all" ON public.appointment_services;
CREATE POLICY "appt_svc_staff_all" ON public.appointment_services FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Clinical Records policies
DROP POLICY IF EXISTS "clinical_records_staff_all" ON public.clinical_records;
CREATE POLICY "clinical_records_staff_all" ON public.clinical_records FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Clinical Files policies
DROP POLICY IF EXISTS "clinical_files_staff_all" ON public.clinical_files;
CREATE POLICY "clinical_files_staff_all" ON public.clinical_files FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Prescriptions policies
DROP POLICY IF EXISTS "prescriptions_staff_all" ON public.prescriptions;
CREATE POLICY "prescriptions_staff_all" ON public.prescriptions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Billing Invoices policies
DROP POLICY IF EXISTS "billing_staff_all" ON public.billing_invoices;
CREATE POLICY "billing_staff_all" ON public.billing_invoices FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Payment Transactions policies
DROP POLICY IF EXISTS "payment_tx_staff_all" ON public.payment_transactions;
CREATE POLICY "payment_tx_staff_all" ON public.payment_transactions FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Staff policies
DROP POLICY IF EXISTS "staff_admin_all" ON public.staff;
CREATE POLICY "staff_admin_all" ON public.staff FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Staff Attendance policies
DROP POLICY IF EXISTS "attendance_staff_all" ON public.staff_attendance;
CREATE POLICY "attendance_staff_all" ON public.staff_attendance FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Inventory policies
DROP POLICY IF EXISTS "inventory_staff_all" ON public.inventory;
CREATE POLICY "inventory_staff_all" ON public.inventory FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Notification Logs policies
DROP POLICY IF EXISTS "logs_staff_all" ON public.notification_logs;
CREATE POLICY "logs_staff_all" ON public.notification_logs FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Clinic Settings policies
DROP POLICY IF EXISTS "settings_staff_all" ON public.clinic_settings;
CREATE POLICY "settings_staff_all" ON public.clinic_settings FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Contact Messages policies
DROP POLICY IF EXISTS "msgs_public_insert" ON public.contact_messages;
CREATE POLICY "msgs_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "msgs_staff_all" ON public.contact_messages;
CREATE POLICY "msgs_staff_all" ON public.contact_messages FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Treatment Plans policies
DROP POLICY IF EXISTS "plans_staff_all" ON public.treatment_plans;
CREATE POLICY "plans_staff_all" ON public.treatment_plans FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Treatment Documents policies
DROP POLICY IF EXISTS "docs_staff_all" ON public.treatment_documents;
CREATE POLICY "docs_staff_all" ON public.treatment_documents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- Admin Users policies
DROP POLICY IF EXISTS "admin_users_admin_all" ON public.admin_users;
CREATE POLICY "admin_users_admin_all" ON public.admin_users FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Website Content policies
DROP POLICY IF EXISTS "content_public_read" ON public.website_content;
CREATE POLICY "content_public_read" ON public.website_content FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "content_staff_all" ON public.website_content;
CREATE POLICY "content_staff_all" ON public.website_content FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- ----------------------------------------------------------------------------
-- 12. STORAGE BUCKETS & POLICIES
-- ----------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-photos','doctor-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('treatment-docs','treatment-docs', false) ON CONFLICT DO NOTHING;

-- doc-photos policies
DROP POLICY IF EXISTS "doc_photos_public_read" ON storage.objects;
CREATE POLICY "doc_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-photos');
DROP POLICY IF EXISTS "doc_photos_staff_write" ON storage.objects;
CREATE POLICY "doc_photos_staff_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "doc_photos_staff_update" ON storage.objects;
CREATE POLICY "doc_photos_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "doc_photos_staff_delete" ON storage.objects;
CREATE POLICY "doc_photos_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));

-- treatment-docs policies
DROP POLICY IF EXISTS "treat_docs_staff_select" ON storage.objects;
CREATE POLICY "treat_docs_staff_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "treat_docs_staff_insert" ON storage.objects;
CREATE POLICY "treat_docs_staff_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "treat_docs_staff_update" ON storage.objects;
CREATE POLICY "treat_docs_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
DROP POLICY IF EXISTS "treat_docs_staff_delete" ON storage.objects;
CREATE POLICY "treat_docs_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));

-- ----------------------------------------------------------------------------
-- 13. PRIVILEGES & SECURITY HARDENING
-- ----------------------------------------------------------------------------
REVOKE SELECT (email, phone) ON public.doctors FROM anon;
REVOKE SELECT (email, phone) ON public.doctors FROM authenticated;
GRANT SELECT (id, user_id, name, role, specialty, qualifications, experience, bio, photo_url, color_code, active, created_at, updated_at) ON public.doctors TO anon;
GRANT SELECT (id, user_id, name, role, specialty, qualifications, experience, bio, email, phone, photo_url, color_code, active, created_at, updated_at) ON public.doctors TO authenticated;

-- ----------------------------------------------------------------------------
-- 14. LOCAL MOCK DATA SEEDING (DOCTORS, TESTIMONIALS, SERVICES, ARTICLES)
-- ----------------------------------------------------------------------------

-- Seed Doctors
INSERT INTO public.doctors (id, name, role, qualifications, experience, bio, specialty, color_code, specialties, active) VALUES
('d1111111-1111-1111-1111-111111111111', 'Dr. Arjun Sharma', 'Founder & Chief Dental Surgeon', 'BDS, MDS — Prosthodontics', '15+ years', 'Specialist in dental implants and full-mouth rehabilitation. Trained in Mumbai and London.', 'Implants', '#EA580C', '{"Implants", "Crowns & Bridges", "Smile Design"}', true),
('d2222222-2222-2222-2222-222222222222', 'Dr. Priya Iyer', 'Senior Cosmetic Dentist', 'BDS, MDS — Cosmetic Dentistry', '10+ years', 'Known for natural-looking veneers and gentle care for anxious patients.', 'Cosmetic', '#9B1C1C', '{"Veneers", "Whitening", "Gum Contouring"}', true),
('d3333333-3333-3333-3333-333333333333', 'Dr. Rohan Mehta', 'Orthodontist', 'BDS, MDS — Orthodontics', '8+ years', 'Certified Invisalign provider. Loves making teens & adults smile confidently.', 'Orthodontics', '#0D9488', '{"Invisalign", "Braces", "Aligners"}', true)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  role = EXCLUDED.role,
  qualifications = EXCLUDED.qualifications,
  experience = EXCLUDED.experience,
  bio = EXCLUDED.bio,
  specialty = EXCLUDED.specialty,
  color_code = EXCLUDED.color_code,
  specialties = EXCLUDED.specialties,
  active = EXCLUDED.active;

-- Seed Testimonials
INSERT INTO public.testimonials (id, name, city, quote, treatment, rating, image_key, sort_order, active) VALUES
(gen_random_uuid(), 'Anjali Verma', 'Delhi', 'Mujhe apni muskaan pe pehli baar itna confidence aaya hai! The team made me feel like family.', 'Smile Makeover with Veneers', 5, 'patient-1', 0, true),
(gen_random_uuid(), 'Sunita Desai', 'Mumbai', 'Single sitting mein dramatic results. Bahut hi clean clinic and humble doctors.', 'Teeth Whitening', 5, 'patient-2', 1, true),
(gen_random_uuid(), 'Ramesh Bhai Patel', 'Ahmedabad', '60 ki umar mein phir se khulkar hasna seekha. Bilkul natural lagta hai!', 'Full Dentures', 5, 'patient-3', 2, true),
(gen_random_uuid(), 'Aarav Kumar', 'Bengaluru', 'Doctor sahab ne har step explain kiya. School mein dost bhi impressed hain.', 'Braces', 5, 'patient-4', 3, true)
ON CONFLICT DO NOTHING;

-- Seed Services (Categories)
INSERT INTO public.services (category, tagline, summary, image_key, doctor_name, sort_order, active) VALUES
('General & Preventive Care', 'Healthy smiles start here', 'Routine check-ups, professional cleanings and digital X-rays form the foundation of lifelong oral health. We catch cavities, gum issues and decay early — long before they become painful or expensive. Ideal for the whole family, every six months.', 'Scaling & Polishing', 'Dr. Arjun Sharma', 0, true),
('Restorative Treatments', 'Bring back your natural bite', 'Damaged, decayed or missing teeth are rebuilt using painless, modern techniques. From single-sitting root canals to ceramic crowns and lifelike dentures, we restore both function and appearance. Eat, smile and speak with full confidence again.', 'Root Canal Treatment (RCT)', 'Dr. Arjun Sharma', 1, true),
('Orthodontics', 'Straighten with confidence', 'Crooked, gapped or crowded teeth are gently guided into perfect alignment. We offer everything from traditional metal braces to nearly invisible clear aligners for kids, teens and working adults. Most cases finish in 12–18 months.', 'Braces', 'Dr. Rohan Mehta', 2, true),
('Cosmetic Dentistry', 'Designer smiles, made for you', 'Transform your smile for that wedding, interview or special moment. Our smile makeovers combine whitening, veneers and gum reshaping to deliver a balanced, photo-ready look. Results you can see — and feel — in just one or two visits.', 'Teeth Whitening', 'Dr. Priya Iyer', 3, true),
('Surgical Procedures', 'Expert hands, gentle care', 'From simple extractions to advanced implant placement, our oral surgeons use sterile, minimally-invasive techniques. Most procedures are completed under local anaesthesia with same-day recovery. Sedation options are available for anxious patients.', 'Dental Implants', 'Dr. Arjun Sharma', 4, true),
('Pediatric Dentistry', 'Gentle care for little smiles', 'Specialized dental care for children, focusing on preventive treatments and a stress-free environment. We make sure your child''s first visits are positive, laying the foundation for a lifetime of healthy teeth.', 'Baby Root Canal (Pulpotomy)', 'Dr. Priya Iyer', 5, true)
ON CONFLICT (category) DO UPDATE SET
  tagline = EXCLUDED.tagline,
  summary = EXCLUDED.summary,
  image_key = EXCLUDED.image_key,
  doctor_name = EXCLUDED.doctor_name,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;

-- Seed Service Articles
INSERT INTO public.service_articles (slug, title, category, meta_title, meta_description, hero_image_key, lead, body, gallery, cta_service, sort_order, active) VALUES

-- 1. Scaling & Polishing
('scaling-and-polishing', 'Scaling & Polishing (Teeth Cleaning)', 'General & Preventive Care', 'Scaling & Polishing (Teeth Cleaning) — Smile Dental Clinic', 'Professional ultrasonic scaling and polishing for healthy gums, fresh breath and brighter teeth. Painless, safe, every 6 months.', 'Scaling & Polishing', 'Scaling and polishing is one of the most important preventive dental treatments that helps maintain healthy teeth and gums. Even if you brush regularly, plaque and tartar can still build up in hard-to-reach areas — leading to gum infection, bad breath, decay and bleeding gums. Professional cleaning keeps your smile fresh and healthy.',
'[
  {"type": "p", "text": "Scaling is the process of removing plaque, tartar, and bacteria from the surface of the teeth and below the gum line using specialised dental instruments. Polishing is done after scaling to smooth the tooth surface and remove stains, making the teeth cleaner and shinier."},
  {"type": "p", "text": "At our dental clinic, we use modern ultrasonic scaling technology that provides gentle and effective cleaning. Before beginning the procedure, our dentist carefully examines your oral condition and checks for plaque buildup, gum inflammation, and any signs of dental problems."},
  {"type": "p", "text": "During the treatment, ultrasonic instruments are used to remove hardened tartar deposits safely and comfortably. Once the scaling is complete, polishing is done using a special paste that helps remove stains caused by tea, coffee, smoking, or certain foods."},
  {"type": "p", "text": "Many patients worry that teeth cleaning may damage their teeth, but professional scaling and polishing are completely safe when performed by trained dental professionals. The procedure is generally painless, although patients with sensitive gums may feel slight discomfort for a short time."},
  {"type": "h2", "text": "Benefits of scaling & polishing"},
  {"type": "ul", "items": [
    "Fresher breath and a clean mouth feel",
    "Healthier, pink gums with reduced bleeding",
    "Reduced risk of cavities and gum disease",
    "Brighter, stain-free teeth",
    "Better overall oral hygiene"
  ]},
  {"type": "p", "text": "We usually recommend professional teeth cleaning every 6 months, depending on the patient''s oral condition. Patients with gum disease or heavy tartar buildup may require more frequent cleanings."}
]', '[]', 'General & Preventive Care', 0, true),

-- 2. Dental Fillings
('dental-fillings', 'Dental Fillings', 'General & Preventive Care', 'Dental Fillings — Tooth-Coloured Composite | Smile Dental', 'Painless tooth-coloured composite fillings to repair cavities and restore tooth strength. Single-visit treatment with natural appearance.', 'Dental Fillings', 'Dental fillings are a common restorative treatment used to repair teeth damaged by cavities, minor fractures, or wear. Tooth decay is one of the most common dental problems and, if left untreated, can lead to severe pain, infection and even tooth loss. Fillings restore strength, shape and function while preventing further decay.',
'[
  {"type": "p", "text": "A cavity forms when bacteria in the mouth produce acids that damage the tooth enamel. Early treatment with fillings prevents the decay from spreading deeper into the tooth."},
  {"type": "h2", "text": "Signs you may need a filling"},
  {"type": "ul", "items": [
    "Tooth sensitivity to hot, cold or sweet foods",
    "Pain while chewing",
    "Visible holes or dark spots on teeth",
    "Food regularly getting stuck in certain areas"
  ]},
  {"type": "p", "text": "At our dental clinic, we begin the treatment with a detailed examination of the affected tooth. In some cases, digital X-rays are taken to determine the extent of decay."},
  {"type": "p", "text": "The dentist first removes the decayed portion of the tooth using modern dental instruments. Once the cavity is cleaned properly, a filling material is placed into the tooth to restore its original shape and strength."},
  {"type": "p", "text": "We mainly use tooth-coloured composite fillings that match the natural shade of your teeth. These fillings provide excellent aesthetics and durability while maintaining a natural appearance."},
  {"type": "h2", "text": "Benefits of dental fillings"},
  {"type": "ul", "items": [
    "Stops tooth decay from spreading",
    "Protects and preserves the natural tooth",
    "Restores comfortable chewing ability",
    "Improves appearance with tooth-coloured material",
    "Prevents future damage and infection"
  ]}
]', '[]', 'General & Preventive Care', 1, true),

-- 3. Oral Exam & X-rays
('oral-exam-and-x-rays', 'Oral Exam & X-rays', 'General & Preventive Care', 'Oral Examination & Digital X-rays — Smile Dental Clinic', 'Comprehensive oral exam with low-radiation digital X-rays for early detection of cavities, gum disease and hidden dental problems.', 'Oral Exam & X-rays', 'Regular oral examinations and dental X-rays are essential for maintaining healthy teeth and gums. Many dental problems begin silently without noticeable symptoms — early detection is the key to preventing major complications in the future.',
'[
  {"type": "p", "text": "An oral examination allows the dentist to evaluate your overall oral health and identify problems such as cavities, gum disease, infections, tooth wear, alignment issues and oral hygiene concerns."},
  {"type": "p", "text": "During a routine dental checkup, our dentist carefully examines your teeth, gums, tongue, jaw and surrounding oral tissues. We also check for signs of decay, gum inflammation, plaque buildup and any hidden dental concerns."},
  {"type": "p", "text": "In many cases, dental X-rays are recommended because some problems cannot be seen with the naked eye. X-rays help detect hidden cavities, root infections, impacted teeth, bone loss and wisdom tooth problems."},
  {"type": "h2", "text": "Why preventive checkups matter"},
  {"type": "ul", "items": [
    "Detect problems at their earliest, most treatable stage",
    "Significantly reduce future treatment costs",
    "Prevent severe infections and tooth loss",
    "Maintain long-term oral and overall health"
  ]}
]', '[]', 'General & Preventive Care', 2, true),

-- 4. Root Canal Treatment
('root-canal-treatment', 'Root Canal Treatment (RCT)', 'Restorative Treatments', 'Root Canal Treatment (RCT) — Painless Single-Sitting | Smile Dental', 'Modern, painless root canal treatment to save infected teeth. Advanced rotary endodontics, completed in single or multiple sittings.', 'Root Canal Treatment (RCT)', 'Root Canal Treatment, commonly called RCT, is a dental procedure used to save a severely infected or damaged tooth. Many people fear root canal treatment because they believe it is painful, but modern dental technology has made the procedure comfortable, safe and highly effective.',
'[
  {"type": "p", "text": "Inside every tooth is a soft tissue called pulp, which contains nerves and blood vessels. When this pulp becomes infected due to deep cavities, cracks, trauma or repeated dental procedures, it can cause severe pain and swelling."},
  {"type": "h2", "text": "Symptoms that may indicate the need for an RCT"},
  {"type": "ul", "items": [
    "Severe, lingering toothache",
    "Sharp sensitivity to hot or cold foods",
    "Swelling or tenderness in the gums",
    "Pain while chewing or biting down",
    "Discoloration or darkening of the tooth"
  ]},
  {"type": "p", "text": "At our clinic, treatment begins with a detailed examination and digital X-rays to determine the extent of infection. The procedure is performed under local anaesthesia to ensure patient comfort."},
  {"type": "p", "text": "After removing the infection, the root canals are cleaned, disinfected and shaped using advanced rotary instruments. Once cleaned properly, the canals are sealed with a special filling material. A dental crown is usually recommended after RCT."}
]', '[]', 'Restorative Treatments', 3, true),

-- 5. Crowns & Bridges
('crowns-and-bridges', 'Crowns & Bridges (Caps)', 'Restorative Treatments', 'Dental Crowns & Bridges (Caps) — Zirconia & Ceramic | Smile Dental', 'Custom-made zirconia, ceramic and metal-ceramic crowns and bridges to restore damaged or missing teeth with natural-looking results.', 'Crowns & Bridges (Caps)', 'Dental crowns and bridges are restorative treatments used to repair damaged teeth and replace missing teeth. They restore chewing ability, improve appearance and protect weakened teeth.',
'[
  {"type": "p", "text": "A dental crown, commonly known as a cap, is placed over a damaged or weak tooth to restore its strength, shape and function. Crowns are often recommended after root canal treatment, large cavities, fractures or worn-down teeth."},
  {"type": "p", "text": "A dental bridge is used to replace one or more missing teeth. It fills the gap by using nearby teeth as support."},
  {"type": "h2", "text": "Types of crowns we offer"},
  {"type": "ul", "items": [
    "Zirconia crowns — extremely strong and natural-looking",
    "Full ceramic (E-max) crowns — best aesthetics for front teeth",
    "Metal-ceramic crowns — durable and budget-friendly"
  ]},
  {"type": "h2", "text": "Benefits of crowns & bridges"},
  {"type": "ul", "items": [
    "Restore damaged or broken teeth",
    "Improve smile appearance",
    "Support natural chewing function",
    "Prevent neighbouring teeth from shifting",
    "Protect weak teeth from further damage"
  ]}
]', '[]', 'Restorative Treatments', 4, true),

-- 6. Dentures
('dentures', 'Dentures', 'Restorative Treatments', 'Complete & Partial Dentures — Comfortable Custom Fit | Smile Dental', 'Natural-looking complete and partial dentures custom-made for comfort, clear speech and confident chewing. Modern materials, perfect fit.', 'Dentures', 'Dentures are removable dental appliances used to replace missing teeth and surrounding tissues. They help patients regain their ability to eat, speak and smile confidently.',
'[
  {"type": "p", "text": "Missing teeth can affect appearance, chewing ability, speech and overall confidence. Dentures provide an affordable and effective solution for restoring oral function."},
  {"type": "h2", "text": "Two main types of dentures"},
  {"type": "ul", "items": [
    "Complete Dentures — used when all teeth are missing",
    "Partial Dentures — used when some natural teeth are still present"
  ]},
  {"type": "p", "text": "At our clinic, denture treatment begins with a detailed oral examination. Precise impressions of the mouth are taken to create custom-made dentures that fit comfortably and look natural."},
  {"type": "h2", "text": "Benefits of dentures"},
  {"type": "ul", "items": [
    "Improved chewing ability",
    "Clearer speech",
    "Enhanced facial appearance",
    "Support for facial muscles",
    "Restored confidence"
  ]}
]', '[]', 'Restorative Treatments', 5, true),

-- 7. Braces
('braces', 'Braces', 'Orthodontics', 'Dental Braces — Metal, Ceramic & Self-Ligating | Smile Dental', 'Affordable metal, ceramic and self-ligating braces for kids, teens and adults. Straighten crooked teeth and fix bite issues in 12–24 months.', 'Braces', 'Braces are orthodontic appliances used to correct crooked teeth, spacing issues, bite problems and jaw alignment. Properly aligned teeth not only improve appearance but also help maintain better oral health.',
'[
  {"type": "p", "text": "Many people experience dental alignment issues such as crowded teeth, gaps between teeth, overbite, underbite or crossbite. Braces gradually move the teeth into the correct position using controlled pressure."},
  {"type": "h2", "text": "Types of braces available"},
  {"type": "ul", "items": [
    "Metal Braces — most affordable and effective",
    "Ceramic Braces — tooth-coloured, less visible",
    "Self-Ligating Braces — fewer adjustments, faster results"
  ]},
  {"type": "h2", "text": "Benefits of braces"},
  {"type": "ul", "items": [
    "Improved smile appearance",
    "Better chewing ability",
    "Easier cleaning of teeth",
    "Improved jaw alignment and bite"
  ]}
]', '[]', 'Orthodontics', 6, true),

-- 8. Invisalign
('invisalign-aligners', 'Invisalign / Aligners', 'Orthodontics', 'Invisalign & Clear Aligners — Invisible Teeth Straightening | Smile Dental', 'Nearly invisible clear aligners (Invisalign) straighten teeth comfortably without metal braces. Removable, easy to clean, perfect for adults.', 'Invisalign : Aligners.jpg', 'Clear aligners, commonly known as Invisalign or transparent aligners, are modern orthodontic treatments used to straighten teeth without traditional braces. Aligners are clear, removable trays custom-made to gradually move teeth into proper alignment.',
'[
  {"type": "p", "text": "This treatment is popular among teenagers and adults because the aligners are nearly invisible and more comfortable than traditional braces."},
  {"type": "p", "text": "At our clinic, treatment begins with digital scans and detailed smile analysis. Using advanced technology, we create a customised treatment plan that shows the expected movement of teeth."},
  {"type": "h2", "text": "Benefits of clear aligners"},
  {"type": "ul", "items": [
    "Nearly invisible appearance",
    "Comfortable, smooth-edged fit",
    "Easy oral hygiene maintenance",
    "Fewer clinic visits required",
    "No food restrictions — remove while eating"
  ]}
]', '[]', 'Orthodontics', 7, true),

-- 9. Teeth Whitening
('teeth-whitening', 'Teeth Whitening', 'Cosmetic Dentistry', 'Professional Teeth Whitening — Laser & In-Clinic | Smile Dental', 'Safe, professional teeth whitening to remove stains from coffee, tea and smoking. Brighter shade in a single visit, lasting results.', 'Teeth Whitening', 'Teeth whitening is a cosmetic dental treatment used to brighten stained or discoloured teeth and improve smile appearance. Teeth can become yellow or stained due to ageing, tea, coffee, smoking, poor oral hygiene or certain medications.',
'[
  {"type": "p", "text": "Professional teeth whitening helps remove deep stains safely and effectively."},
  {"type": "p", "text": "At our clinic, the process begins with an oral examination to ensure the teeth and gums are healthy. A protective layer is applied to the gums, and a professional whitening gel is placed on the teeth. Advanced laser/light technology activates the gel."},
  {"type": "h2", "text": "Benefits of professional whitening"},
  {"type": "ul", "items": [
    "Visibly brighter, whiter teeth",
    "Improved confidence and youthful smile",
    "Safe for enamel under expert supervision",
    "Quick results in a single visit"
  ]}
]', '[]', 'Cosmetic Dentistry', 8, true),

-- 10. Veneers
('veneers', 'Veneers', 'Cosmetic Dentistry', 'Porcelain Veneers — Bollywood-Perfect Smile | Smile Dental', 'Ultra-thin porcelain veneers to fix chipped, stained or uneven teeth. Custom-designed for a flawless, natural-looking smile makeover.', 'Veneers', 'Dental veneers are thin custom-made shells placed on the front surface of teeth to improve their appearance. They are commonly used to correct chipped teeth, stained teeth, gaps, uneven teeth and minor alignment issues.',
'[
  {"type": "p", "text": "Porcelain veneers are highly popular because they provide a natural appearance and excellent durability."},
  {"type": "p", "text": "A small amount of enamel is removed from the front surface of the teeth to prepare them for veneers. Impressions or digital scans are taken to create customised veneers that match the patient''s smile. Once ready, they are bonded securely."},
  {"type": "h2", "text": "Benefits of veneers"},
  {"type": "ul", "items": [
    "Dramatically improved smile appearance",
    "Excellent stain resistance",
    "Natural translucent aesthetics",
    "Long-lasting and durable results"
  ]}
]', '[]', 'Cosmetic Dentistry', 9, true),

-- 11. Gum Contouring
('gum-contouring', 'Gum Contouring', 'Cosmetic Dentistry', 'Laser Gum Contouring — Fix Gummy Smile | Smile Dental', 'Painless laser gum contouring to reshape uneven gum lines and fix gummy smiles. Quick procedure with fast healing and beautiful results.', 'Gum Contouring', 'Gum contouring is a cosmetic dental procedure used to reshape uneven or excessive gum tissue to improve smile appearance. Some patients have a ''gummy smile'' where too much gum is visible, while others have uneven gum lines that affect tooth proportions.',
'[
  {"type": "p", "text": "Gum contouring helps create a balanced and symmetrical smile."},
  {"type": "p", "text": "At our clinic, treatment begins with smile analysis and gum evaluation. Using advanced laser technology, excess gum tissue is carefully reshaped to expose more of the tooth surface. Lasers ensure precise contouring and minimal bleeding."},
  {"type": "h2", "text": "Benefits of gum contouring"},
  {"type": "ul", "items": [
    "Improved smile aesthetics",
    "Balanced, symmetrical gum line",
    "Better tooth proportions",
    "Increased confidence"
  ]}
]', '[]', 'Cosmetic Dentistry', 10, true),

-- 12. Tooth Extraction
('tooth-extraction', 'Tooth Extraction', 'Surgical Procedures', 'Painless Tooth Extraction — Wisdom Teeth & More | Smile Dental', 'Safe, painless tooth extraction including impacted wisdom teeth surgery under local anaesthesia. Gentle techniques for fast recovery.', 'Tooth Extraction', 'Tooth extraction is a dental procedure performed to remove severely damaged, decayed, infected or impacted teeth. Although dentists always try to save natural teeth whenever possible, extraction may become necessary in certain situations.',
'[
  {"h2": "Common reasons for tooth extraction"},
  {"ul": [
    "Severe tooth decay beyond restoration",
    "Advanced gum disease causing tooth mobility",
    "Impacted wisdom teeth",
    "Broken teeth beyond repair",
    "Overcrowding before orthodontic treatment"
  ]},
  {"type": "p", "text": "At our clinic, the procedure begins with a detailed examination and digital X-rays to understand the tooth position. Local anaesthesia ensures a painless procedure. The dentist gently loosens the tooth and removes it carefully."}
]', '[]', 'Surgical Procedures', 11, true),

-- 13. Dental Implants
('dental-implants', 'Dental Implants', 'Surgical Procedures', 'Dental Implants — Permanent Tooth Replacement | Smile Dental', 'Premium titanium dental implants that look, feel and function like natural teeth. Advanced 3D planning, lifetime durability, EMI options.', 'Dental Implants', 'Dental implants are one of the most advanced and permanent solutions for replacing missing teeth. An implant is a titanium post placed into the jawbone that acts like an artificial tooth root. Once healed, a crown is attached to restore the appearance and function of the missing tooth.',
'[
  {"type": "p", "text": "Dental implants look, feel and function very similar to natural teeth."},
  {"type": "p", "text": "The implant is surgically placed into the jawbone under local anaesthesia. Over the next few months, the implant integrates naturally with the bone through a process called osseointegration. Once healed, a custom-made crown is attached."},
  {"type": "h2", "text": "Benefits of dental implants"},
  {"type": "ul", "items": [
    "Natural appearance and feel",
    "Improved chewing ability — eat anything you love",
    "Long-lasting, often lifetime solution",
    "Prevention of jawbone loss",
    "Better speech and overall comfort"
  ]}
]',
'[
  { "src": "implant-4", "alt": "Dentist reviewing dental X-ray for implant planning", "caption": "Digital planning — 3D CBCT scan ensures precise, safe positioning" },
  { "src": "implant-3", "alt": "Happy patient smiling after dental implant treatment", "caption": "Result — A confident, natural-looking smile that lasts a lifetime" }
]', 'Surgical Procedures', 12, true),

-- 14. Pit & Fissure Sealants
('pit-and-fissure-sealants', 'Pit & Fissure Sealants for Children', 'Pediatric Dentistry', 'Pit & Fissure Sealants for Children — Smile Dental Clinic', 'Protective fissure sealants for kids'' teeth. Safe, painless cavity prevention coating for chewing surfaces of molars.', 'Baby Root Canal Treatment.jpeg', 'Pit and fissure sealants are a simple and highly effective preventive dental treatment designed to protect children''s teeth from cavities. By sealing the deep grooves and pits on the chewing surfaces of back teeth, sealants act as a protective barrier against food particles and decay-causing bacteria.',
'[
  {"type": "p", "text": "The chewing surfaces of children''s molars and premolars have deep pits and fissures that are hard to clean with regular toothbrushing. Food particles and plaque collect in these grooves, making them highly susceptible to decay."},
  {"type": "p", "text": "Dental sealants are thin, safe plastic coatings applied to these chewing surfaces. The procedure is completely painless, quick, and requires no drilling or removal of tooth structure, making it ideal for young children."},
  {"type": "p", "text": "During the visit, our dentist cleans the tooth surface thoroughly, applies a mild conditioning solution to help the sealant bond, and then paints the sealant onto the tooth enamel. A special curing light is used to harden the sealant within seconds."},
  {"type": "h2", "text": "Benefits of pit & fissure sealants"},
  {"type": "ul", "items": [
    "Forms a protective shield over vulnerable tooth grooves",
    "Prevents up to 80% of cavities in back teeth",
    "Painless and fast application in a single visit",
    "Durable protection that lasts for several years",
    "Saves children from future dental pain and fillings"
  ]},
  {"type": "p", "text": "We recommend applying sealants as soon as the child''s permanent molars erupt, usually around age 6 for the first molars and age 12 for the second molars. Regular checkups ensure the sealants remain intact and continue providing optimal protection."}
]', '[]', 'Pediatric Dentistry', 13, true),

-- 15. Baby Root Canal
('baby-root-canal-treatment', 'Baby Root Canal (Pulpotomy)', 'Pediatric Dentistry', 'Baby Root Canal Treatment (Pulpotomy) for Kids — Smile Dental Clinic', 'Painless baby root canal treatment (pulpotomy) to save infected primary teeth. Protects natural spacing and permanent teeth development.', 'Baby Root Canal Treatment.jpeg', 'Baby root canal treatment, also known as a pulpotomy, is a specialised pediatric dental procedure used to save a severely decayed or infected baby tooth. Preserving primary teeth is crucial for proper chewing, speech development, and guiding permanent teeth into their correct positions.',
'[
  {"type": "p", "text": "When decay reaches the inner pulp of a baby tooth, it can cause severe pain, swelling, and infection. A pulpotomy removes the infected portion of the pulp while keeping the healthy root pulp alive, preventing the need for extraction."},
  {"type": "h2", "text": "Signs your child may need a pulpotomy"},
  {"type": "ul", "items": [
    "Persistent toothache or pain, especially at night",
    "Extreme sensitivity to hot or cold food and drinks",
    "Swelling or redness in the gums surrounding the tooth",
    "Unexplained tooth sensitivity or pain while chewing"
  ]},
  {"type": "p", "text": "At our clinic, we focus on making the treatment comfortable and stress-free for children. We use gentle local anaesthesia to ensure the child feels no pain. The dentist carefully accesses the tooth, removes the decayed structure and infected coronal pulp, applies a therapeutic medication to protect the remaining pulp, and seals the tooth."},
  {"type": "p", "text": "After the pulpotomy, a pediatric crown (often a durable stainless steel or white zirconia crown) is placed over the tooth to restore its strength and protect it from future fractures. The treated baby tooth remains functional until it naturally falls out to make way for the permanent tooth."},
  {"type": "h2", "text": "Why saving baby teeth matters"},
  {"type": "ul", "items": [
    "Maintains proper spacing for permanent teeth",
    "Prevents speech difficulties and chewing problems",
    "Avoids alignment issues and the need for complex braces later",
    "Ensures healthy bone and gum development"
  ]},
  {"type": "p", "text": "Our team is highly experienced in gentle child dentistry, focusing on positive, reassuring communication to keep your child relaxed and happy throughout the visit."}
]', '[]', 'Pediatric Dentistry', 14, true),

-- 16. Fluoride Treatment
('fluoride-treatment-for-kids', 'Fluoride Treatment for Kids', 'Pediatric Dentistry', 'Fluoride Treatment for Kids — Enamel Strengthening | Smile Dental Clinic', 'Safe and effective professional fluoride varnish treatments for children. Strengthens tooth enamel and prevents cavities in a single quick visit.', 'Fluoride Treatment for Kids.jpg', 'Fluoride treatment is a safe, painless, and highly effective preventive procedure that strengthens children''s teeth and protects them against decay. By replenishing essential minerals in the tooth enamel, fluoride helps make teeth highly resistant to acid attacks from plaque and sugars.',
'[
  {"type": "p", "text": "As children''s teeth develop, the enamel is still maturing and is more susceptible to acid wear and cavities. Professional fluoride applications provide a concentrated boost of minerals that actively rebuilds weakened enamel and stops early-stage decay."},
  {"type": "p", "text": "Our clinic uses a child-friendly fluoride varnish that is gently painted onto the teeth using a tiny brush. The varnish sets quickly upon contact with saliva, forms a sticky layer that slowly releases fluoride into the enamel over several hours."},
  {"type": "p", "text": "The entire application takes only a couple of minutes and is completely tasteless and comfortable for the child. Children can eat and drink soft foods immediately after the appointment, though they should avoid brushing or flossing until the next morning to allow maximum absorption."},
  {"type": "h2", "text": "Benefits of fluoride treatment for kids"},
  {"type": "ul", "items": [
    "Actively hardens and strengthens developing enamel",
    "Prevents new cavities and reverses early micro-decay",
    "Completely painless, quick, and non-invasive application",
    "Provides long-lasting protection between dental checkups",
    "Safe and recommended by pediatric dental associations worldwide"
  ]},
  {"type": "p", "text": "We generally recommend professional fluoride treatments every 6 months during routine cleaning visits. For children with a high risk of cavities, more frequent applications may be advised to ensure their smiles remain strong and healthy."}
]', '[]', 'Pediatric Dentistry', 15, true)

ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  meta_title = EXCLUDED.meta_title,
  meta_description = EXCLUDED.meta_description,
  hero_image_key = EXCLUDED.hero_image_key,
  lead = EXCLUDED.lead,
  body = EXCLUDED.body,
  gallery = EXCLUDED.gallery,
  cta_service = EXCLUDED.cta_service,
  sort_order = EXCLUDED.sort_order,
  active = EXCLUDED.active;
