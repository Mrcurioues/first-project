import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Stethoscope, Smile, Crown, Wrench, type LucideIcon } from "lucide-react";

const ICON_MAP: Record<string, LucideIcon> = {
  Sparkles, Stethoscope, Smile, Crown, Wrench,
};
export function resolveIcon(name: string | null | undefined): LucideIcon {
  return (name && ICON_MAP[name]) || Stethoscope;
}

export type Testimonial = {
  id: string;
  name: string;
  city: string | null;
  treatment: string | null;
  quote: string;
  rating: number;
  image_key: string | null;
  sort_order: number;
  active: boolean;
};

export type ServiceRow = {
  id: string;
  category: string;
  tagline: string | null;
  summary: string | null;
  icon: string | null;
  image_key: string | null;
  doctor_name: string | null;
  sort_order: number;
  active: boolean;
};

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] };

export type GalleryImg = { src: string; alt: string; caption: string };

export type ArticleRow = {
  id: string;
  slug: string;
  title: string;
  category: string;
  meta_title: string | null;
  meta_description: string | null;
  hero_image_key: string | null;
  lead: string | null;
  body: Block[];
  gallery: GalleryImg[];
  cta_service: string | null;
  sort_order: number;
  active: boolean;
};

export async function listTestimonials(): Promise<Testimonial[]> {
  try {
    const { data, error } = await supabase
      .from("testimonials")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return (data as Testimonial[]);
    }
  } catch (err) {
    console.warn("Failed to fetch testimonials from Supabase, using local fallback", err);
  }
  return [];
}

export async function listServices(): Promise<ServiceRow[]> {
  try {
    const { data, error } = await supabase
      .from("services")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return (data as ServiceRow[]);
    }
  } catch (err) {
    console.warn("Failed to fetch services from Supabase, using local fallback", err);
  }
  return [];
}

import { articles as localArticles } from "@/data/articles";

export async function listArticles(): Promise<ArticleRow[]> {
  try {
    const { data, error } = await supabase
      .from("service_articles")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((a) => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        category: a.category,
        meta_title: a.meta_title,
        meta_description: a.meta_description,
        hero_image_key: a.hero_image_key,
        lead: a.lead,
        body: (typeof a.body === "string" ? JSON.parse(a.body) : a.body) as Block[],
        gallery: (typeof a.gallery === "string" ? JSON.parse(a.gallery) : a.gallery ?? []) as GalleryImg[],
        cta_service: a.cta_service,
        sort_order: a.sort_order,
        active: a.active,
      }));
    }
  } catch (err) {
    console.warn("Failed to fetch articles from Supabase, using local fallback", err);
  }

  return localArticles.map((a, idx) => ({
    id: a.slug,
    slug: a.slug,
    title: a.title,
    category: a.category,
    meta_title: a.metaTitle,
    meta_description: a.metaDescription,
    hero_image_key: a.hero,
    lead: a.lead,
    body: a.body,
    gallery: a.gallery ?? [],
    cta_service: a.ctaService,
    sort_order: idx,
    active: true,
  }));
}

export async function getArticleBySlug(slug: string): Promise<ArticleRow | null> {
  try {
    const { data, error } = await supabase
      .from("service_articles")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        slug: data.slug,
        title: data.title,
        category: data.category,
        meta_title: data.meta_title,
        meta_description: data.meta_description,
        hero_image_key: data.hero_image_key,
        lead: data.lead,
        body: (typeof data.body === "string" ? JSON.parse(data.body) : data.body) as Block[],
        gallery: (typeof data.gallery === "string" ? JSON.parse(data.gallery) : data.gallery ?? []) as GalleryImg[],
        cta_service: data.cta_service,
        sort_order: data.sort_order,
        active: data.active,
      };
    }
  } catch (err) {
    console.warn(`Failed to fetch article ${slug} from Supabase, using local fallback`, err);
  }

  const article = localArticles.find((a) => a.slug === slug);
  if (!article) return null;
  return {
    id: article.slug,
    slug: article.slug,
    title: article.title,
    category: article.category,
    meta_title: article.metaTitle,
    meta_description: article.metaDescription,
    hero_image_key: article.hero,
    lead: article.lead,
    body: article.body,
    gallery: article.gallery ?? [],
    cta_service: article.ctaService,
    sort_order: 0,
    active: true,
  };
}

export type ServiceWithItems = ServiceRow & {
  items: { slug: string; name: string; description: string }[];
};

import { services as localServices } from "@/data/services";

export async function listServicesWithItems(): Promise<ServiceWithItems[]> {
  try {
    const [svcsRes, artsRes] = await Promise.all([
      supabase.from("services").select("*").order("sort_order", { ascending: true }),
      supabase.from("service_articles").select("slug, title, category").order("sort_order", { ascending: true }),
    ]);

    if (!svcsRes.error && !artsRes.error && svcsRes.data && svcsRes.data.length > 0) {
      return svcsRes.data.map((s) => {
        const items = (artsRes.data ?? [])
          .filter((a) => a.category === s.category)
          .map((a) => ({
            slug: a.slug,
            name: a.title,
            description: "",
          }));
        return {
          id: s.id,
          category: s.category,
          tagline: s.tagline,
          summary: s.summary,
          icon: s.icon,
          image_key: s.image_key,
          doctor_name: s.doctor_name,
          sort_order: s.sort_order,
          active: s.active,
          items,
        };
      });
    }
  } catch (err) {
    console.warn("Failed to fetch services with items from Supabase, using local fallback", err);
  }

  return localServices.map((s, idx) => ({
    id: s.category,
    category: s.category,
    tagline: s.tagline,
    summary: s.summary,
    icon: null,
    image_key: s.image,
    doctor_name: s.doctorName,
    sort_order: idx,
    active: true,
    items: s.items.map((it) => ({
      slug: it.slug,
      name: it.name,
      description: it.description,
    })),
  }));
}

