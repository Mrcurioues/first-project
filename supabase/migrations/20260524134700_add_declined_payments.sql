-- ============================================================================
-- ADD DECLINED PAYMENTS STATUS AND TRACKER TABLE
-- ============================================================================

-- 1. Alter check constraint on billing_invoices to support 'declined' status
ALTER TABLE public.billing_invoices DROP CONSTRAINT IF EXISTS billing_invoices_status_check;
ALTER TABLE public.billing_invoices ADD CONSTRAINT billing_invoices_status_check CHECK (status IN ('unpaid', 'partial', 'paid', 'refunded', 'declined'));

-- 2. Create declined_payments table
CREATE TABLE IF NOT EXISTS public.declined_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.billing_invoices(id) ON DELETE CASCADE,
  patient_id UUID REFERENCES public.patients(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  invoice_number TEXT NOT NULL,
  declined_amount DECIMAL(10, 2) NOT NULL,
  reason TEXT,
  declined_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE public.declined_payments ENABLE ROW LEVEL SECURITY;

-- 4. Enable RLS policy for staff access
DROP POLICY IF EXISTS "declined_payments_staff_all" ON public.declined_payments;
CREATE POLICY "declined_payments_staff_all" ON public.declined_payments
  FOR ALL TO authenticated
  USING (public.is_staff(auth.uid()))
  WITH CHECK (public.is_staff(auth.uid()));
