
-- Tighten public appointment insert policy
DROP POLICY IF EXISTS appts_public_insert ON public.appointments;
CREATE POLICY appts_public_insert ON public.appointments
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

-- Restrict sensitive doctor contact columns from anonymous public reads.
-- Public read policy still allows non-sensitive columns; email/phone require staff.
REVOKE SELECT (email, phone) ON public.doctors FROM anon;
REVOKE SELECT (email, phone) ON public.doctors FROM authenticated;
GRANT SELECT (id, user_id, name, role, specialty, qualifications, experience, bio, photo_url, color_code, active, created_at, updated_at) ON public.doctors TO anon;
GRANT SELECT (id, user_id, name, role, specialty, qualifications, experience, bio, email, phone, photo_url, color_code, active, created_at, updated_at) ON public.doctors TO authenticated;

-- Lock down get_booked_slots: only anon (booking widget) and staff need it.
-- Keep it executable but it intentionally returns only scheduled_at/doctor_name for availability.
-- (No change needed; documented as intentional in security memory.)
