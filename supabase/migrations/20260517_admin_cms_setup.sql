-- Admin CMS Setup
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'admin',
  created_at timestamptz default now()
);

create table if not exists public.website_content (
  id uuid primary key default gen_random_uuid(),
  section_key text unique not null,
  title text,
  content jsonb,
  updated_at timestamptz default now()
);

create table if not exists public.services (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique,
  description text,
  image text,
  active boolean default true,
  created_at timestamptz default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  name text,
  phone text,
  email text,
  service text,
  message text,
  status text default 'new',
  created_at timestamptz default now()
);

alter publication supabase_realtime add table public.website_content;
alter publication supabase_realtime add table public.services;
alter publication supabase_realtime add table public.appointments;
