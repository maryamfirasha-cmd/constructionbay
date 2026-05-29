-- ============================================================
-- ConstructionBay.mv — Initial Database Schema
-- ============================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES TABLE (extends auth.users)
-- ============================================================
create table if not exists public.profiles (
  id          uuid references auth.users on delete cascade primary key,
  full_name   text,
  company_name text,
  phone       text,
  whatsapp    text,
  avatar_url  text,
  is_supplier boolean not null default false,
  bio         text,
  location    text,
  website     text,
  verified    boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- LISTINGS TABLE
-- ============================================================
create table if not exists public.listings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.profiles(id) on delete cascade,
  title        text not null,
  description  text,
  price        numeric(14, 2),
  price_unit   text check (price_unit in ('total', 'per_day', 'per_week', 'per_month', 'negotiable')) default 'total',
  currency     text not null default 'MVR',
  category     text not null check (category in ('materials', 'equipment', 'services')),
  listing_type text not null check (listing_type in ('buy', 'sell', 'rent', 'surplus', 'service')),
  location     text,
  images       text[],
  status       text not null default 'active' check (status in ('active', 'sold', 'expired', 'draft')),
  condition    text check (condition in ('new', 'used', 'refurbished')),
  quantity     integer,
  unit         text,
  views        integer not null default 0,
  featured     boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for common queries
create index listings_status_idx on public.listings(status);
create index listings_category_idx on public.listings(category);
create index listings_listing_type_idx on public.listings(listing_type);
create index listings_user_id_idx on public.listings(user_id);
create index listings_created_at_idx on public.listings(created_at desc);

-- Full text search
alter table public.listings add column if not exists search_vector tsvector
  generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(description, ''))
  ) stored;
create index listings_search_idx on public.listings using gin(search_vector);

-- ============================================================
-- WANTED REQUESTS TABLE
-- ============================================================
create table if not exists public.wanted_requests (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  description text,
  category    text check (category in ('materials', 'equipment', 'services')),
  budget      numeric(14, 2),
  currency    text not null default 'MVR',
  location    text,
  urgency     text check (urgency in ('low', 'medium', 'high', 'urgent')) default 'medium',
  status      text not null default 'open' check (status in ('open', 'fulfilled', 'closed')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index wanted_requests_status_idx on public.wanted_requests(status);
create index wanted_requests_user_id_idx on public.wanted_requests(user_id);

-- ============================================================
-- HELPER FUNCTION: increment views
-- ============================================================
create or replace function public.increment_listing_views(listing_id uuid)
returns void as $$
begin
  update public.listings set views = views + 1 where id = listing_id;
end;
$$ language plpgsql security definer;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

alter table public.profiles enable row level security;
alter table public.listings enable row level security;
alter table public.wanted_requests enable row level security;

-- Profiles: anyone can read, only own user can update
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

-- Listings: anyone can read active listings
create policy "Active listings are publicly readable"
  on public.listings for select using (
    status = 'active' or auth.uid() = user_id
  );

create policy "Authenticated users can create listings"
  on public.listings for insert with check (
    auth.uid() is not null and auth.uid() = user_id
  );

create policy "Users can update their own listings"
  on public.listings for update using (auth.uid() = user_id);

create policy "Users can delete their own listings"
  on public.listings for delete using (auth.uid() = user_id);

-- Wanted requests: publicly readable
create policy "Wanted requests are publicly readable"
  on public.wanted_requests for select using (true);

create policy "Authenticated users can create wanted requests"
  on public.wanted_requests for insert with check (
    auth.uid() is not null and auth.uid() = user_id
  );

create policy "Users can update their own wanted requests"
  on public.wanted_requests for update using (auth.uid() = user_id);

create policy "Users can delete their own wanted requests"
  on public.wanted_requests for delete using (auth.uid() = user_id);

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard or via CLI)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('listing-images', 'listing-images', true);
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);

-- Storage policies for listing-images
-- create policy "Anyone can view listing images"
--   on storage.objects for select using (bucket_id = 'listing-images');
-- create policy "Authenticated users can upload listing images"
--   on storage.objects for insert with check (
--     bucket_id = 'listing-images' and auth.uid() is not null
--   );
-- create policy "Users can delete their own listing images"
--   on storage.objects for delete using (
--     bucket_id = 'listing-images' and auth.uid()::text = (storage.foldername(name))[1]
--   );
