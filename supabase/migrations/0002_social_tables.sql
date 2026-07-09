-- ============================================================================
-- 0002_social_tables.sql
-- Reviews, favorites, private notes, messaging, and the admin audit log.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- reviews — one per (business, author)
-- ----------------------------------------------------------------------------

create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  author_id uuid not null references public.profiles (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  owner_reply text,
  owner_reply_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (business_id, author_id)
);

create index reviews_business_id_idx on public.reviews (business_id);
create index reviews_author_id_idx on public.reviews (author_id);

-- ----------------------------------------------------------------------------
-- favorites — many-to-many, user saved businesses
-- ----------------------------------------------------------------------------

create table public.favorites (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (profile_id, business_id)
);

create index favorites_business_id_idx on public.favorites (business_id);

-- ----------------------------------------------------------------------------
-- notes — private per-user notes on a business (never shown to anyone else)
-- ----------------------------------------------------------------------------

create table public.notes (
  profile_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  body text not null default '',
  updated_at timestamptz not null default now(),
  primary key (profile_id, business_id)
);

-- ----------------------------------------------------------------------------
-- conversations — one thread per (business, customer) pair
-- ----------------------------------------------------------------------------

create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses (id) on delete cascade,
  customer_id uuid not null references public.profiles (id) on delete cascade,
  last_message_at timestamptz,
  customer_unread_count int not null default 0,
  business_unread_count int not null default 0,
  created_at timestamptz not null default now(),
  unique (business_id, customer_id)
);

create index conversations_business_id_idx on public.conversations (business_id);
create index conversations_customer_id_idx on public.conversations (customer_id);

-- ----------------------------------------------------------------------------
-- messages — individual chat messages within a conversation
-- ----------------------------------------------------------------------------

create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid references public.profiles (id),
  sender_type public.message_sender_type not null,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index messages_conversation_id_idx on public.messages (conversation_id, created_at);

-- ----------------------------------------------------------------------------
-- admin_audit_log — records moderation/administrative actions for accountability
-- ----------------------------------------------------------------------------

create table public.admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles (id),
  action text not null, -- e.g. 'business.publish', 'user.role_change'
  target_table text,
  target_id uuid,
  metadata jsonb not null default '{}',
  created_at timestamptz not null default now()
);

create index admin_audit_log_actor_id_idx on public.admin_audit_log (actor_id);
create index admin_audit_log_target_idx on public.admin_audit_log (target_table, target_id);
