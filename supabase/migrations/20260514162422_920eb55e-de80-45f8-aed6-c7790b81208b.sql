
-- =========================================================
-- ENUMS
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'staff', 'doctor');
CREATE TYPE public.appointment_status AS ENUM ('pending','approved','completed','cancelled');
CREATE TYPE public.treatment_status AS ENUM ('planned','in_progress','completed','cancelled');
CREATE TYPE public.message_status AS ENUM ('new','read','archived');

-- =========================================================
-- PROFILES
-- =========================================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- USER ROLES (separate table — security best practice)
-- =========================================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

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

-- =========================================================
-- DOCTORS
-- =========================================================
CREATE TABLE public.doctors (
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
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- PATIENTS
-- =========================================================
CREATE TABLE public.patients (
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
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_patients_phone ON public.patients(phone);

-- =========================================================
-- APPOINTMENTS
-- =========================================================
CREATE TABLE public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reference_id TEXT NOT NULL UNIQUE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE SET NULL,
  -- Snapshot fields for public bookings (no patient row yet)
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  patient_email TEXT,
  doctor_name TEXT,
  service TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_min INT NOT NULL DEFAULT 30,
  status public.appointment_status NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE INDEX idx_appts_scheduled_at ON public.appointments(scheduled_at);
CREATE INDEX idx_appts_status ON public.appointments(status);
CREATE UNIQUE INDEX idx_appts_unique_slot ON public.appointments(scheduled_at, doctor_name) WHERE status <> 'cancelled';

-- =========================================================
-- TREATMENT PLANS
-- =========================================================
CREATE TABLE public.treatment_plans (
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
ALTER TABLE public.treatment_plans ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- TREATMENT DOCUMENTS
-- =========================================================
CREATE TABLE public.treatment_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.treatment_plans(id) ON DELETE CASCADE,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  mime_type TEXT,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.treatment_documents ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- CONTACT MESSAGES
-- =========================================================
CREATE TABLE public.contact_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  message TEXT NOT NULL,
  status public.message_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- =========================================================
-- updated_at trigger
-- =========================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

CREATE TRIGGER trg_doctors_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_patients_updated BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_appts_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_plans_updated BEFORE UPDATE ON public.treatment_plans FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =========================================================
-- RLS POLICIES
-- =========================================================

-- profiles: own row
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT TO authenticated USING (id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());

-- user_roles: staff can read, admin can manage
CREATE POLICY "roles_select_staff" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_staff(auth.uid()));
CREATE POLICY "roles_admin_all" ON public.user_roles FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- doctors: public can read active doctors; staff full
CREATE POLICY "doctors_public_read" ON public.doctors FOR SELECT USING (active = true);
CREATE POLICY "doctors_staff_all" ON public.doctors FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- patients: staff only
CREATE POLICY "patients_staff_all" ON public.patients FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- appointments: PUBLIC INSERT (booking form), staff read/update/delete
CREATE POLICY "appts_public_insert" ON public.appointments FOR INSERT WITH CHECK (true);
CREATE POLICY "appts_staff_select" ON public.appointments FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "appts_staff_update" ON public.appointments FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "appts_staff_delete" ON public.appointments FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- Public can check whether a slot is taken (read minimal info) — needed for the booking form availability check.
-- We expose ALL columns; the form only fetches scheduled_at + status. If you want stricter privacy create a view.
CREATE POLICY "appts_public_select_slots" ON public.appointments FOR SELECT USING (status <> 'cancelled');

-- treatment plans / docs: staff only
CREATE POLICY "plans_staff_all" ON public.treatment_plans FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "docs_staff_all" ON public.treatment_documents FOR ALL TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));

-- contact messages: PUBLIC INSERT, staff manage
CREATE POLICY "msgs_public_insert" ON public.contact_messages FOR INSERT WITH CHECK (true);
CREATE POLICY "msgs_staff_select" ON public.contact_messages FOR SELECT TO authenticated USING (public.is_staff(auth.uid()));
CREATE POLICY "msgs_staff_update" ON public.contact_messages FOR UPDATE TO authenticated USING (public.is_staff(auth.uid())) WITH CHECK (public.is_staff(auth.uid()));
CREATE POLICY "msgs_staff_delete" ON public.contact_messages FOR DELETE TO authenticated USING (public.is_staff(auth.uid()));

-- =========================================================
-- STORAGE BUCKETS
-- =========================================================
INSERT INTO storage.buckets (id, name, public) VALUES ('doctor-photos','doctor-photos', true) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('treatment-docs','treatment-docs', false) ON CONFLICT DO NOTHING;

-- doctor-photos: public read, staff write
CREATE POLICY "doc_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'doctor-photos');
CREATE POLICY "doc_photos_staff_write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "doc_photos_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));
CREATE POLICY "doc_photos_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'doctor-photos' AND public.is_staff(auth.uid()));

-- treatment-docs: staff only
CREATE POLICY "treat_docs_staff_select" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
CREATE POLICY "treat_docs_staff_insert" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
CREATE POLICY "treat_docs_staff_update" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
CREATE POLICY "treat_docs_staff_delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'treatment-docs' AND public.is_staff(auth.uid()));
