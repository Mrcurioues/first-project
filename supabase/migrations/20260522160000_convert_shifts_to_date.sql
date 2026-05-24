-- Convert doctor_shifts from day_of_week (weekly) to shift_date (specific date)
ALTER TABLE public.doctor_shifts ADD COLUMN IF NOT EXISTS shift_date DATE;

-- Populate existing shifts with today's date so NOT NULL constraint won't fail
UPDATE public.doctor_shifts SET shift_date = CURRENT_DATE WHERE shift_date IS NULL;

-- Drop day_of_week and make shift_date NOT NULL
ALTER TABLE public.doctor_shifts ALTER COLUMN shift_date SET NOT NULL;
ALTER TABLE public.doctor_shifts DROP COLUMN IF EXISTS day_of_week;
