-- ============================================================================
-- 0007_customer_ratings.sql
-- Owner → customer ratings (reputation), plus denormalized aggregates on profiles.
-- Also exposes review-activity helpers owners see in the inbox.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Denormalized reputation on profiles (from customer_ratings)
-- ----------------------------------------------------------------------------

alter table public.profiles
  add column if not exists customer_avg_rating numeric(2, 1) not null default 0,
  add column if not exists customer_rating_count int not null default 0;

comment on column public.profiles.customer_avg_rating is
  'Average of ratings this person has received from business owners.';
comment on column public.profiles.customer_rating_count is
  'Number of owner ratings this person has received.';

-- ----------------------------------------------------------------------------
-- customer_ratings — one rating per (customer, rater) pair
-- ----------------------------------------------------------------------------

create table if not exists public.customer_ratings (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid not null references public.profiles (id) on delete cascade,
  rater_id uuid not null references public.profiles (id) on delete cascade,
  business_id uuid not null references public.businesses (id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (customer_id, rater_id),
  check (customer_id <> rater_id)
);

create index if not exists customer_ratings_customer_id_idx on public.customer_ratings (customer_id);
create index if not exists customer_ratings_rater_id_idx on public.customer_ratings (rater_id);
create index if not exists customer_ratings_business_id_idx on public.customer_ratings (business_id);

comment on table public.customer_ratings is
  'Ratings business owners leave for customers after interacting (e.g. messaging).';

create trigger set_updated_at before update on public.customer_ratings
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- Keep profiles.customer_avg_rating / customer_rating_count in sync
-- ----------------------------------------------------------------------------

create or replace function public.refresh_customer_reputation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.customer_id, old.customer_id);
begin
  update public.profiles p
  set customer_avg_rating = coalesce(
        (select round(avg(rating)::numeric, 1) from public.customer_ratings cr where cr.customer_id = target),
        0
      ),
      customer_rating_count = (
        select count(*)::int from public.customer_ratings cr where cr.customer_id = target
      )
  where p.id = target;
  return null;
end;
$$;

drop trigger if exists customer_ratings_refresh_reputation on public.customer_ratings;
create trigger customer_ratings_refresh_reputation
  after insert or update or delete on public.customer_ratings
  for each row execute function public.refresh_customer_reputation();

-- ----------------------------------------------------------------------------
-- RLS
-- ----------------------------------------------------------------------------

alter table public.customer_ratings enable row level security;

-- Anyone authenticated can read reputation (needed for inbox / trust signals).
drop policy if exists "customer_ratings_authenticated_read" on public.customer_ratings;
create policy "customer_ratings_authenticated_read" on public.customer_ratings
  for select to authenticated using (true);

-- Owners may rate a customer only if they manage the related business and have
-- an existing conversation with that customer on that business.
drop policy if exists "customer_ratings_owner_write" on public.customer_ratings;
create policy "customer_ratings_owner_write" on public.customer_ratings
  for insert to authenticated
  with check (
    rater_id = auth.uid()
    and public.owns_business(business_id)
    and exists (
      select 1 from public.conversations c
      where c.business_id = business_id
        and c.customer_id = customer_id
    )
  );

drop policy if exists "customer_ratings_owner_update" on public.customer_ratings;
create policy "customer_ratings_owner_update" on public.customer_ratings
  for update to authenticated
  using (rater_id = auth.uid() and public.owns_business(business_id))
  with check (rater_id = auth.uid() and public.owns_business(business_id));

drop policy if exists "customer_ratings_owner_delete" on public.customer_ratings;
create policy "customer_ratings_owner_delete" on public.customer_ratings
  for delete to authenticated
  using (rater_id = auth.uid() or public.is_admin());
