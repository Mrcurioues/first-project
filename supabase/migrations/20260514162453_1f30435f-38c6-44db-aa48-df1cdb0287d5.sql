
DROP POLICY IF EXISTS "appts_public_select_slots" ON public.appointments;

CREATE OR REPLACE FUNCTION public.get_booked_slots(_from TIMESTAMPTZ, _to TIMESTAMPTZ)
RETURNS TABLE(scheduled_at TIMESTAMPTZ, doctor_name TEXT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT scheduled_at, doctor_name
  FROM public.appointments
  WHERE status <> 'cancelled' AND scheduled_at >= _from AND scheduled_at < _to;
$$;

GRANT EXECUTE ON FUNCTION public.get_booked_slots(TIMESTAMPTZ, TIMESTAMPTZ) TO anon, authenticated;
