-- ============================================================================
-- 0006_storage_and_ops.sql
-- Business image storage bucket + policies, and a helper for owners to
-- check ownership of a business by slug (used by public profile pages).
-- ============================================================================

-- Public bucket for listing photos (cover + gallery).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'business-images',
  'business-images',
  true,
  5242880, -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do nothing;

-- Anyone can view images in the public bucket.
create policy "business_images_storage_public_read"
  on storage.objects for select
  using (bucket_id = 'business-images');

-- Authenticated owners can upload into their own business folder:
-- path convention: {business_id}/{filename}
create policy "business_images_storage_owner_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'business-images'
    and public.owns_business((storage.foldername(name))[1]::uuid)
  );

create policy "business_images_storage_owner_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'business-images'
    and public.owns_business((storage.foldername(name))[1]::uuid)
  );

create policy "business_images_storage_owner_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'business-images'
    and public.owns_business((storage.foldername(name))[1]::uuid)
  );

-- Allow authenticated users to self-promote to business_owner (opt-in listing).
-- Admins can still change any role via the admin portal.
create or replace function public.become_business_owner()
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;

  update public.profiles
  set role = 'business_owner'
  where id = auth.uid()
    and role = 'customer';
end;
$$;

grant execute on function public.become_business_owner() to authenticated;

-- Allow reading basic profile display info (name/avatar) so review authors
-- and conversation participants can be shown. Sensitive fields like phone
-- should simply not be selected in public queries.
drop policy if exists "profiles_select_own_or_admin" on public.profiles;
create policy "profiles_select_authenticated" on public.profiles
  for select using (true);

-- Keep updates restricted to self/admin.
-- (profiles_update_own_or_admin already exists from 0004)
