import 'server-only'

import { createClient as createJsClient } from '@supabase/supabase-js'

import type { Database } from './database.types'

/**
 * Cookie-free Supabase client for read-only, public catalog data (active
 * categories/cities, published businesses, etc.).
 *
 * Unlike `lib/supabase/server.ts`, this does NOT call `cookies()`, so using
 * it doesn't force the calling route into fully dynamic, per-request
 * rendering. That lets pages like the home/search pages actually benefit
 * from `export const revalidate = ...` (ISR) instead of re-querying Supabase
 * on every single request.
 *
 * Only use this for queries whose RLS policies don't depend on the caller's
 * identity (e.g. `status = 'published'` / `is_active = true` rows). Anything
 * that needs to know "is this the owner/admin?" (drafts, dashboards, social
 * actions) must keep using `lib/supabase/server.ts`.
 */
export function createPublicClient() {
  return createJsClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    },
  )
}
