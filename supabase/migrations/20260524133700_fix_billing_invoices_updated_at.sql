-- ============================================================================
-- FIX: ADD MISSING updated_at COLUMN TO billing_invoices TABLE
-- ============================================================================

-- Add the missing updated_at column to ensure the trg_billing_invoices_updated trigger operates correctly
ALTER TABLE public.billing_invoices ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();
