
-- Testimonials
CREATE TABLE public.testimonials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  city text,
  treatment text,
  quote text NOT NULL,
  rating int NOT NULL DEFAULT 5 CHECK (rating BETWEEN 1 AND 5),
  image_key text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
CREATE POLICY testimonials_public_read ON public.testimonials FOR SELECT TO public USING (active = true);
CREATE POLICY testimonials_staff_all ON public.testimonials FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_testimonials_updated BEFORE UPDATE ON public.testimonials FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Services (categories)
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL UNIQUE,
  tagline text,
  summary text,
  icon text,            -- lucide name e.g. "Stethoscope"
  image_key text,
  doctor_name text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY services_public_read ON public.services FOR SELECT TO public USING (active = true);
CREATE POLICY services_staff_all ON public.services FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_services_updated BEFORE UPDATE ON public.services FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Service Articles (one per slug)
CREATE TABLE public.service_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  category text NOT NULL,
  short_description text,
  meta_title text,
  meta_description text,
  hero_image_key text,
  lead text,
  body jsonb NOT NULL DEFAULT '[]'::jsonb,
  gallery jsonb NOT NULL DEFAULT '[]'::jsonb,
  cta_service text,
  sort_order int NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.service_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY articles_public_read ON public.service_articles FOR SELECT TO public USING (active = true);
CREATE POLICY articles_staff_all ON public.service_articles FOR ALL TO authenticated USING (is_staff(auth.uid())) WITH CHECK (is_staff(auth.uid()));
CREATE TRIGGER trg_articles_updated BEFORE UPDATE ON public.service_articles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE INDEX idx_articles_category ON public.service_articles(category);
