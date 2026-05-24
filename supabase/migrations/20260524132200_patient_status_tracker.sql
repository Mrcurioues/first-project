-- ============================================================================
-- SMILE DENTAL CLINIC - REAL-TIME PATIENT STATUS TRACKER SETUP
-- Run this in your Supabase SQL Editor (https://supabase.com)
-- ============================================================================

-- 1. Create Patient Status Tracker table
CREATE TABLE IF NOT EXISTS public.patient_status_tracker (
  patient_id UUID PRIMARY KEY REFERENCES public.patients(id) ON DELETE CASCADE,
  patient_name TEXT NOT NULL,
  patient_phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('new', 'repeat')),
  total_appointments INT NOT NULL DEFAULT 0,
  last_appointment_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable RLS
ALTER TABLE public.patient_status_tracker ENABLE ROW LEVEL SECURITY;

-- 3. Policy for Staff Access
DROP POLICY IF EXISTS "tracker_staff_all" ON public.patient_status_tracker;
CREATE POLICY "tracker_staff_all" ON public.patient_status_tracker 
  FOR ALL TO authenticated 
  USING (public.is_staff(auth.uid())) 
  WITH CHECK (public.is_staff(auth.uid()));

-- 4. Trigger function to compute and update patient status in real-time
CREATE OR REPLACE FUNCTION public.sync_patient_status_tracker()
RETURNS TRIGGER AS $$
DECLARE
  v_name TEXT;
  v_phone TEXT;
  v_created_at TIMESTAMPTZ;
  v_appt_count INT;
  v_last_appt TIMESTAMPTZ;
  v_status TEXT;
  v_target_patient_id UUID;
BEGIN
  -- Identify patient_id based on trigger context
  IF TG_OP = 'DELETE' THEN
    IF TG_TABLE_NAME = 'patients' THEN
      DELETE FROM public.patient_status_tracker WHERE patient_id = OLD.id;
      RETURN OLD;
    ELSE
      v_target_patient_id := OLD.patient_id;
    END IF;
  ELSE
    IF TG_TABLE_NAME = 'patients' THEN
      v_target_patient_id := NEW.id;
    ELSE
      v_target_patient_id := NEW.patient_id;
    END IF;
  END IF;

  IF v_target_patient_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Query latest patient info
  SELECT full_name, phone, created_at INTO v_name, v_phone, v_created_at
  FROM public.patients
  WHERE id = v_target_patient_id;

  IF v_name IS NULL THEN
    RETURN NEW;
  END IF;

  -- Count non-cancelled appointments
  SELECT COUNT(*), MAX(scheduled_at) INTO v_appt_count, v_last_appt
  FROM public.appointments
  WHERE patient_id = v_target_patient_id AND status != 'cancelled';

  -- Classification logic: New if created in the last 30 days AND <= 1 visit. Else Repeat.
  IF v_created_at >= (now() - interval '30 days') AND COALESCE(v_appt_count, 0) <= 1 THEN
    v_status := 'new';
  ELSE
    v_status := 'repeat';
  END IF;

  -- Upsert
  INSERT INTO public.patient_status_tracker (patient_id, patient_name, patient_phone, status, total_appointments, last_appointment_at, updated_at)
  VALUES (v_target_patient_id, v_name, v_phone, v_status, COALESCE(v_appt_count, 0), v_last_appt, now())
  ON CONFLICT (patient_id) DO UPDATE SET
    patient_name = EXCLUDED.patient_name,
    patient_phone = EXCLUDED.patient_phone,
    status = EXCLUDED.status,
    total_appointments = EXCLUDED.total_appointments,
    last_appointment_at = EXCLUDED.last_appointment_at,
    updated_at = now();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Trigger bindings
DROP TRIGGER IF EXISTS trg_patients_sync_tracker ON public.patients;
CREATE TRIGGER trg_patients_sync_tracker
AFTER INSERT OR UPDATE OR DELETE ON public.patients
FOR EACH ROW EXECUTE FUNCTION public.sync_patient_status_tracker();

DROP TRIGGER IF EXISTS trg_appointments_sync_tracker ON public.appointments;
CREATE TRIGGER trg_appointments_sync_tracker
AFTER INSERT OR UPDATE OR DELETE ON public.appointments
FOR EACH ROW EXECUTE FUNCTION public.sync_patient_status_tracker();

-- 6. Seed existing patient records
INSERT INTO public.patient_status_tracker (patient_id, patient_name, patient_phone, status, total_appointments, last_appointment_at, updated_at)
SELECT 
  p.id as patient_id,
  p.full_name as patient_name,
  p.phone as patient_phone,
  CASE 
    WHEN p.created_at >= (now() - interval '30 days') AND (SELECT COUNT(*) FROM public.appointments a WHERE a.patient_id = p.id AND a.status != 'cancelled') <= 1 THEN 'new'
    ELSE 'repeat'
  END as status,
  (SELECT COUNT(*) FROM public.appointments a WHERE a.patient_id = p.id AND a.status != 'cancelled') as total_appointments,
  (SELECT MAX(scheduled_at) FROM public.appointments a WHERE a.patient_id = p.id AND a.status != 'cancelled') as last_appointment_at,
  now() as updated_at
FROM public.patients p
ON CONFLICT (patient_id) DO UPDATE SET
  status = EXCLUDED.status,
  total_appointments = EXCLUDED.total_appointments,
  last_appointment_at = EXCLUDED.last_appointment_at,
  updated_at = now();
