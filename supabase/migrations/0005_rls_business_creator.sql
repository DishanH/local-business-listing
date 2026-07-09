-- ============================================================================
-- 0005_rls_business_creator.sql
-- Fix self-serve listing creation:
-- 1. Creators can read/update their own drafts via created_by (needed for
--    INSERT … RETURNING before business_owners row is visible to RLS).
-- 2. Backfill profiles for auth users created before handle_new_user existed.
-- ============================================================================

-- Backfill any auth.users that are missing a profiles row.
insert into public.profiles (id, full_name, avatar_url, role)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data ->> 'avatar_url',
  'customer'
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
on conflict (id) do nothing;

-- Callable from the app before first write (e.g. listing creation) so users
-- who signed up before migrations still get a profile row.
create or replace function public.ensure_profile()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, role)
  select
    u.id,
    coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
    u.raw_user_meta_data ->> 'avatar_url',
    'customer'
  from auth.users u
  where u.id = auth.uid()
  on conflict (id) do nothing;
end;
$$;

grant execute on function public.ensure_profile() to authenticated;

-- ----------------------------------------------------------------------------
-- businesses — allow creators to read/update their own drafts
-- ----------------------------------------------------------------------------

drop policy if exists "businesses_public_read_published" on public.businesses;
create policy "businesses_public_read_published" on public.businesses
  for select using (
    status = 'published'
    or created_by = auth.uid()
    or public.owns_business(id)
    or public.is_admin()
  );

drop policy if exists "businesses_owner_update" on public.businesses;
create policy "businesses_owner_update" on public.businesses
  for update using (
    created_by = auth.uid()
    or public.owns_business(id)
    or public.is_admin()
  );
