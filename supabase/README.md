# Database setup

This folder contains hand-written SQL for the Supabase/Postgres schema. There's
no linked Supabase project or CLI session in this environment, so the files
are meant to be applied manually the first time.

## Apply the schema to your Supabase project

**Option A — SQL editor (fastest, no CLI needed)**

1. Open your project's [SQL editor](https://supabase.com/dashboard/project/_/sql/new).
2. Paste and run each file in `migrations/` **in order** (0001 → 0004).
3. Paste and run `seed.sql` to populate categories, subcategories, filters, and starter cities.

**Option B — Supabase CLI**

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push          # applies everything in supabase/migrations
npx supabase db execute -f supabase/seed.sql
```

## What's in here

| File | Purpose |
| --- | --- |
| `migrations/0001_init_schema.sql` | Enums, `profiles`, taxonomy (`categories`, `filters`, `cities`), and every business-owned table (hours, offerings/menu, specials, posts, images). |
| `migrations/0002_social_tables.sql` | `reviews`, `favorites`, `notes`, `conversations`, `messages`, `admin_audit_log`. |
| `migrations/0003_functions_triggers.sql` | `updated_at` maintenance, auto-create a `profiles` row on sign-up, RLS helper functions (`is_admin`, `owns_business`), rating aggregation, unread-count maintenance, auto-ownership on listing creation. |
| `migrations/0004_rls_policies.sql` | Row Level Security for every table. |
| `migrations/0005_rls_business_creator.sql` | Fix listing creation: creators can read/update own drafts; backfill missing profiles. |
| `migrations/0006_storage_and_ops.sql` | `business-images` storage bucket + policies; `become_business_owner()` opt-in RPC. |
| `seed.sql` | ~22 top-level categories with ~140 subcategories, ~25 filters/amenities, and 3 starter cities. |

## Schema overview

- **Accounts**: `profiles` extends `auth.users` 1:1 with a `role` (`customer` / `business_owner` / `admin`). A trigger creates the row automatically on sign-up.
- **Taxonomy**: `categories` is a single self-referencing table (`parent_id`) so top-level categories and subcategories share one table. `filters` are generic amenities/tags, optionally scoped to a category.
- **Listings**: `businesses` is the core table (status workflow: `draft` → `pending_review` → `published`, plus `suspended`/`archived`). `business_owners` is a many-to-many join so a business can have multiple managers and a person can manage multiple businesses.
- **Business content**: `business_hours` (per day of week), `business_offering_sections` + `business_offerings` (a generic "menu" model that also works for salon services, gym classes, retail products, etc.), `business_specials` (rotating/day-specific promos), `business_posts` (offers/events/updates), `business_images`.
- **Social**: `reviews`, `favorites`, `notes` (private per-user), `conversations` + `messages` (one thread per business/customer pair).
- **Admin**: `admin_audit_log` records moderation actions (status changes, role changes).

Full-text search is built in via a generated `search_vector` column on
`businesses` (GIN-indexed), plus a GIN index on the `keywords` array for the
existing keyword-matching behavior.

## Next steps

1. **Wire real auth into the public site.** The marketing site currently uses a simulated sign-in (`components/store-provider.tsx`). The portals (`/admin`, `/dashboard`) use real Supabase Auth via `/login`. Unifying these — e.g. replacing the demo `SignInDialog` with real Supabase email/password + Google OAuth — is the natural next step once you've configured the Google provider in Supabase Auth settings.
2. **Migrate `lib/data.ts` mock data into Supabase.** Categories/cities slugs were chosen to match the mock data 1:1, so a migration script can map old string ids to new UUIDs.
3. **Point the public pages (`/`, `/search`, `/business/[id]`) at the data-access layer** in `lib/supabase/queries/*` instead of the static mock arrays.
4. **Flesh out remaining portal screens** as needed: photo uploads (Supabase Storage), offerings/menu editor, review moderation, category CRUD UI, business claiming flow for existing (seeded) listings.
5. If you need to expose user emails in the admin Users page, add a `SUPABASE_SECRET_KEY` (service role) server-only env var and call `supabase.auth.admin.listUsers()` from a server action — the anon/publishable key can't read `auth.users` directly.
