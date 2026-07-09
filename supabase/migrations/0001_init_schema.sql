-- ============================================================================
-- 0001_init_schema.sql
-- Core schema for Localry: profiles, taxonomy (categories/filters), businesses
-- and all business-owned content (hours, offerings, specials, posts, images).
-- ============================================================================

create extension if not exists pgcrypto;

-- ----------------------------------------------------------------------------
-- Enums
-- ----------------------------------------------------------------------------

create type public.user_role as enum ('customer', 'business_owner', 'admin');

create type public.business_status as enum (
  'draft',           -- owner is still editing, not visible publicly
  'pending_review',  -- submitted, waiting for admin approval
  'published',       -- live and visible to the public
  'suspended',       -- hidden by an admin (policy violation, etc.)
  'archived'         -- soft-deleted / permanently closed
);

create type public.business_owner_role as enum ('owner', 'manager', 'staff');

create type public.post_type as enum ('offer', 'event', 'update');

create type public.message_sender_type as enum ('customer', 'business', 'system');

-- ----------------------------------------------------------------------------
-- profiles — one row per auth.users, holds app-specific account data
-- ----------------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  phone text,
  role public.user_role not null default 'customer',
  -- soft "ban"/disable switch admins can flip without deleting the account
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level profile data for every authenticated user, keyed to auth.users.';

-- ----------------------------------------------------------------------------
-- categories — self-referencing taxonomy (top-level categories + subcategories)
-- ----------------------------------------------------------------------------

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.categories (id) on delete cascade,
  slug text not null unique,
  name text not null,
  -- lucide-react icon name, used by the UI
  icon text,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.categories is
  'Hierarchical taxonomy. Top-level rows have parent_id = null; subcategories reference their parent.';

create index categories_parent_id_idx on public.categories (parent_id);
create index categories_active_idx on public.categories (is_active) where is_active;

-- ----------------------------------------------------------------------------
-- filters — generic attributes/amenities businesses can be tagged with
-- (e.g. "Outdoor seating", "Free WiFi", "Wheelchair accessible"). Optionally
-- scoped to a top-level category so the UI can show category-relevant filters.
-- ----------------------------------------------------------------------------

create table public.filters (
  id uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete cascade,
  slug text not null unique,
  label text not null,
  -- UI grouping, e.g. "Amenities", "Payment", "Accessibility"
  group_name text not null default 'General',
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.filters is
  'Generic tag/amenity catalogue. Null category_id means the filter applies to every category.';

create index filters_category_id_idx on public.filters (category_id);

-- ----------------------------------------------------------------------------
-- cities — service areas / locations
-- ----------------------------------------------------------------------------

create table public.cities (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  region text,
  country text not null default 'US',
  lat double precision not null,
  lng double precision not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- businesses — the core listing table
-- ----------------------------------------------------------------------------

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  tagline text,
  description text,

  category_id uuid not null references public.categories (id),
  subcategory_id uuid references public.categories (id),

  status public.business_status not null default 'draft',
  price_level smallint check (price_level between 1 and 4),

  email text,
  phone text,
  website text,

  address_line1 text,
  address_line2 text,
  city_id uuid references public.cities (id),
  postal_code text,
  lat double precision,
  lng double precision,

  cover_image_url text,
  is_featured boolean not null default false,

  -- denormalized aggregates, kept in sync by triggers (see 0002)
  avg_rating numeric(2, 1) not null default 0,
  review_count int not null default 0,

  -- free-text search aliases, e.g. {"coper fork", "bistro", "farm to table"}
  keywords text[] not null default '{}',

  search_vector tsvector,

  created_by uuid references public.profiles (id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz
);

comment on table public.businesses is 'Primary business/listing record.';

create index businesses_category_id_idx on public.businesses (category_id);
create index businesses_subcategory_id_idx on public.businesses (subcategory_id);
create index businesses_city_id_idx on public.businesses (city_id);
create index businesses_status_idx on public.businesses (status);
create index businesses_featured_idx on public.businesses (is_featured) where is_featured;
create index businesses_keywords_gin_idx on public.businesses using gin (keywords);
create index businesses_search_vector_idx on public.businesses using gin (search_vector);

-- ----------------------------------------------------------------------------
-- business_owners — join table: which profiles manage which businesses
-- (supports multiple owners per business and multiple businesses per owner)
-- ----------------------------------------------------------------------------

create table public.business_owners (
  business_id uuid not null references public.businesses (id) on delete cascade,
  profile_id uuid not null references public.profiles (id) on delete cascade,
  role public.business_owner_role not null default 'owner',
  created_at timestamptz not null default now(),
  primary key (business_id, profile_id)
);

create index business_owners_profile_id_idx on public.business_owners (profile_id);

-- ----------------------------------------------------------------------------
-- business_filters — join table: business <-> filters (amenities/tags)
-- ----------------------------------------------------------------------------

create table public.business_filters (
  business_id uuid not null references public.businesses (id) on delete cascade,
  filter_id uuid not null references public.filters (id) on delete cascade,
  primary key (business_id, filter_id)
);

create index business_filters_filter_id_idx on public.business_filters (filter_id);

-- ----------------------------------------------------------------------------
-- business_images — gallery photos beyond the single cover_image_url
-- ----------------------------------------------------------------------------

create table public.business_images (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  url text not null,
  alt_text text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index business_images_business_id_idx on public.business_images (business_id);

-- ----------------------------------------------------------------------------
-- business_hours — one row per day of week (0 = Sunday .. 6 = Saturday)
-- ----------------------------------------------------------------------------

create table public.business_hours (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  -- minutes from midnight; both null means closed that day
  open_minute int,
  close_minute int,
  unique (business_id, day_of_week)
);

create index business_hours_business_id_idx on public.business_hours (business_id);

-- ----------------------------------------------------------------------------
-- business_offering_sections / business_offerings — a generic "menu" model
-- that works for restaurant menus, salon service lists, gym class types,
-- retail product lists, etc.
-- ----------------------------------------------------------------------------

create table public.business_offering_sections (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  name text not null, -- e.g. "Mains", "Hair services", "Membership plans"
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index offering_sections_business_id_idx on public.business_offering_sections (business_id);

create table public.business_offerings (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  section_id uuid references public.business_offering_sections (id) on delete cascade,
  name text not null,
  description text,
  -- prefer price_cents for real currency math; price_label covers "Starting at $50" cases
  price_cents int,
  price_label text,
  tag text, -- e.g. "Popular", "New", "Vegan"
  image_url text,
  is_available boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index offerings_business_id_idx on public.business_offerings (business_id);
create index offerings_section_id_idx on public.business_offerings (section_id);

-- ----------------------------------------------------------------------------
-- business_specials — rotating/limited-time specials, optionally tied to a
-- specific day of week (e.g. "Taco Tuesday")
-- ----------------------------------------------------------------------------

create table public.business_specials (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  day_of_week smallint check (day_of_week between 0 and 6), -- null = any day
  name text not null,
  description text,
  price_cents int,
  price_label text,
  starts_on date,
  ends_on date,
  created_at timestamptz not null default now()
);

create index specials_business_id_idx on public.business_specials (business_id);

-- ----------------------------------------------------------------------------
-- business_posts — owner-authored offers / events / announcements
-- ----------------------------------------------------------------------------

create table public.business_posts (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  author_id uuid references public.profiles (id),
  type public.post_type not null,
  title text not null,
  body text not null,
  badge text, -- short highlight, e.g. "20% off"
  published_at timestamptz not null default now(),
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index posts_business_id_idx on public.business_posts (business_id);
create index posts_published_at_idx on public.business_posts (published_at desc);

-- ----------------------------------------------------------------------------
-- Trigger function to maintain search_vector on businesses table
-- ----------------------------------------------------------------------------

create or replace function public.update_business_search_vector()
returns trigger as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.tagline, '')), 'B') ||
    setweight(to_tsvector('english', array_to_string(coalesce(new.keywords, '{}'), ' ')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description, '')), 'C');
  return new;
end;
$$ language plpgsql;

create trigger businesses_search_vector_update
  before insert or update of name, tagline, keywords, description
  on public.businesses
  for each row
  execute function public.update_business_search_vector();
