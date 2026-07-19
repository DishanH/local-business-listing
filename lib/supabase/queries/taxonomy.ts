import 'server-only'

import { cache } from 'react'

import { categories as mockCategories, cities as mockCities } from '@/lib/data'
import type { Category, City } from '@/lib/types'
import { createPublicClient } from '@/lib/supabase/public'

/**
 * Top-level categories for the public site. Falls back to the bundled mock
 * taxonomy if Supabase has no rows yet (e.g. `supabase/seed.sql` hasn't been
 * run), so the site never renders an empty category list.
 *
 * Wrapped in `cache()` so the several call sites that need this in a single
 * request (root layout, footer, homepage sections) share one query instead
 * of re-fetching it 3+ times per page load.
 */
export const getAppCategories = cache(async (): Promise<Category[]> => {
  const supabase = createPublicClient()
  const { data, error } = await supabase
    .from('categories')
    .select('slug, name, icon')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order')

  if (error || !data?.length) return mockCategories

  return data.map((c) => ({ id: c.slug, name: c.name, icon: c.icon ?? 'Store' }))
})

/** Service-area cities/towns, with the same mock fallback as categories. */
export const getAppCities = cache(async (): Promise<City[]> => {
  const supabase = createPublicClient()
  const { data, error } = await supabase.from('cities').select('slug, name, lat, lng').eq('is_active', true).order('name')

  if (error || !data?.length) return mockCities

  return data.map((c) => ({ id: c.slug, name: c.name, lat: c.lat, lng: c.lng }))
})
