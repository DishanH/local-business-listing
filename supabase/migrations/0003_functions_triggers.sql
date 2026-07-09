-- ============================================================================
-- 0003_functions_triggers.sql
-- Helper functions used by RLS policies + business-logic triggers.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- updated_at maintenance
-- ----------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.categories
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.businesses
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.business_offerings
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.business_posts
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.reviews
  for each row execute function public.set_updated_at();
create trigger set_updated_at before update on public.notes
  for each row execute function public.set_updated_at();

-- ----------------------------------------------------------------------------
-- auth.users -> profiles bootstrap
-- ----------------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ----------------------------------------------------------------------------
-- RLS helper functions (security definer so they can read tables the calling
-- role may not have direct SELECT rights on, avoiding recursive-policy issues)
-- ----------------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  );
$$;

create or replace function public.owns_business(target_business_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.business_owners bo
    where bo.business_id = target_business_id and bo.profile_id = auth.uid()
  );
$$;

-- ----------------------------------------------------------------------------
-- Keep businesses.category_id / subcategory_id consistent
-- ----------------------------------------------------------------------------

create or replace function public.validate_business_category()
returns trigger
language plpgsql
as $$
begin
  if new.subcategory_id is not null then
    if not exists (
      select 1 from public.categories c
      where c.id = new.subcategory_id and c.parent_id = new.category_id
    ) then
      raise exception 'subcategory_id must be a child of category_id';
    end if;
  end if;
  return new;
end;
$$;

create trigger businesses_validate_category
  before insert or update on public.businesses
  for each row execute function public.validate_business_category();

-- ----------------------------------------------------------------------------
-- Auto-grant ownership to whoever creates a business (self-serve listing
-- creation). Additional owners/managers beyond the creator are still
-- admin-managed via business_owners for now.
-- ----------------------------------------------------------------------------

create or replace function public.assign_creator_as_owner()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.created_by is not null then
    insert into public.business_owners (business_id, profile_id, role)
    values (new.id, new.created_by, 'owner')
    on conflict (business_id, profile_id) do nothing;
  end if;
  return new;
end;
$$;

create trigger businesses_assign_creator_as_owner
  after insert on public.businesses
  for each row execute function public.assign_creator_as_owner();

-- ----------------------------------------------------------------------------
-- Keep businesses.avg_rating / review_count denormalized aggregates in sync
-- ----------------------------------------------------------------------------

create or replace function public.refresh_business_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  target uuid := coalesce(new.business_id, old.business_id);
begin
  update public.businesses b
  set avg_rating = coalesce((select round(avg(rating)::numeric, 1) from public.reviews r where r.business_id = target), 0),
      review_count = (select count(*) from public.reviews r where r.business_id = target)
  where b.id = target;
  return null;
end;
$$;

create trigger reviews_refresh_rating
  after insert or update or delete on public.reviews
  for each row execute function public.refresh_business_rating();

-- ----------------------------------------------------------------------------
-- Keep conversations.last_message_at / unread counters in sync
-- ----------------------------------------------------------------------------

create or replace function public.on_message_inserted()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.conversations c
  set last_message_at = new.created_at,
      customer_unread_count = case when new.sender_type = 'business' then c.customer_unread_count + 1 else c.customer_unread_count end,
      business_unread_count = case when new.sender_type = 'customer' then c.business_unread_count + 1 else c.business_unread_count end
  where c.id = new.conversation_id;
  return new;
end;
$$;

create trigger messages_after_insert
  after insert on public.messages
  for each row execute function public.on_message_inserted();
