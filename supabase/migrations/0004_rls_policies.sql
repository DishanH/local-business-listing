-- ============================================================================
-- 0004_rls_policies.sql
-- Row Level Security for every table. Default posture: public can read
-- published/active content; writes are restricted to owners/admins.
-- ============================================================================

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.filters enable row level security;
alter table public.cities enable row level security;
alter table public.businesses enable row level security;
alter table public.business_owners enable row level security;
alter table public.business_filters enable row level security;
alter table public.business_images enable row level security;
alter table public.business_hours enable row level security;
alter table public.business_offering_sections enable row level security;
alter table public.business_offerings enable row level security;
alter table public.business_specials enable row level security;
alter table public.business_posts enable row level security;
alter table public.reviews enable row level security;
alter table public.favorites enable row level security;
alter table public.notes enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.admin_audit_log enable row level security;

-- ----------------------------------------------------------------------------
-- profiles
-- ----------------------------------------------------------------------------

create policy "profiles_select_own_or_admin" on public.profiles
  for select using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin" on public.profiles
  for update using (id = auth.uid() or public.is_admin());

-- insertion happens exclusively via the handle_new_user trigger (security definer)

-- ----------------------------------------------------------------------------
-- categories / filters / cities — public reference data
-- ----------------------------------------------------------------------------

create policy "categories_public_read" on public.categories
  for select using (is_active or public.is_admin());

create policy "categories_admin_write" on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

create policy "filters_public_read" on public.filters
  for select using (true);

create policy "filters_admin_write" on public.filters
  for all using (public.is_admin()) with check (public.is_admin());

create policy "cities_public_read" on public.cities
  for select using (is_active or public.is_admin());

create policy "cities_admin_write" on public.cities
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- businesses
-- ----------------------------------------------------------------------------

create policy "businesses_public_read_published" on public.businesses
  for select using (
    status = 'published'
    or public.owns_business(id)
    or public.is_admin()
  );

create policy "businesses_owner_insert" on public.businesses
  for insert with check (created_by = auth.uid() or public.is_admin());

create policy "businesses_owner_update" on public.businesses
  for update using (public.owns_business(id) or public.is_admin());

create policy "businesses_admin_delete" on public.businesses
  for delete using (public.is_admin());

-- ----------------------------------------------------------------------------
-- business_owners — only admins manage ownership grants (keeps "claiming" a
-- deliberate, auditable action rather than self-service)
-- ----------------------------------------------------------------------------

create policy "business_owners_select" on public.business_owners
  for select using (profile_id = auth.uid() or public.is_admin());

create policy "business_owners_admin_write" on public.business_owners
  for all using (public.is_admin()) with check (public.is_admin());

-- ----------------------------------------------------------------------------
-- business_filters / business_images / business_hours / offerings / specials
-- / posts — public can read when the parent business is published; only the
-- business's own owners (or admins) can write.
-- ----------------------------------------------------------------------------

create policy "business_filters_read" on public.business_filters
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "business_filters_write" on public.business_filters
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "business_images_read" on public.business_images
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "business_images_write" on public.business_images
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "business_hours_read" on public.business_hours
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "business_hours_write" on public.business_hours
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "offering_sections_read" on public.business_offering_sections
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "offering_sections_write" on public.business_offering_sections
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "offerings_read" on public.business_offerings
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "offerings_write" on public.business_offerings
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "specials_read" on public.business_specials
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "specials_write" on public.business_specials
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

create policy "posts_read" on public.business_posts
  for select using (
    exists (select 1 from public.businesses b where b.id = business_id and (b.status = 'published' or public.owns_business(b.id) or public.is_admin()))
  );
create policy "posts_write" on public.business_posts
  for all using (public.owns_business(business_id) or public.is_admin())
  with check (public.owns_business(business_id) or public.is_admin());

-- ----------------------------------------------------------------------------
-- reviews — anyone can read; authenticated users manage their own review;
-- business owners may only update the owner_reply columns via app logic;
-- admins can moderate (delete) any review.
-- ----------------------------------------------------------------------------

create policy "reviews_public_read" on public.reviews
  for select using (true);

create policy "reviews_author_insert" on public.reviews
  for insert with check (author_id = auth.uid());

create policy "reviews_author_or_owner_update" on public.reviews
  for update using (author_id = auth.uid() or public.owns_business(business_id) or public.is_admin());

create policy "reviews_author_or_admin_delete" on public.reviews
  for delete using (author_id = auth.uid() or public.is_admin());

-- ----------------------------------------------------------------------------
-- favorites / notes — private to the owning profile
-- ----------------------------------------------------------------------------

create policy "favorites_owner_only" on public.favorites
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

create policy "notes_owner_only" on public.notes
  for all using (profile_id = auth.uid()) with check (profile_id = auth.uid());

-- ----------------------------------------------------------------------------
-- conversations / messages — only the customer, the business's owners, or
-- admins can see a thread.
-- ----------------------------------------------------------------------------

create policy "conversations_participants" on public.conversations
  for select using (
    customer_id = auth.uid() or public.owns_business(business_id) or public.is_admin()
  );

create policy "conversations_customer_insert" on public.conversations
  for insert with check (customer_id = auth.uid());

create policy "conversations_participants_update" on public.conversations
  for update using (
    customer_id = auth.uid() or public.owns_business(business_id) or public.is_admin()
  );

create policy "messages_participants_read" on public.messages
  for select using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or public.owns_business(c.business_id) or public.is_admin())
    )
  );

create policy "messages_participants_insert" on public.messages
  for insert with check (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.customer_id = auth.uid() or public.owns_business(c.business_id) or public.is_admin())
    )
  );

-- ----------------------------------------------------------------------------
-- admin_audit_log — admins only
-- ----------------------------------------------------------------------------

create policy "admin_audit_log_admin_only" on public.admin_audit_log
  for all using (public.is_admin()) with check (public.is_admin());
