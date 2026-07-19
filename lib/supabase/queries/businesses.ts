import 'server-only'

import { cache } from 'react'

import { businesses as mockBusinesses } from '@/lib/data'
import { createClient } from '@/lib/supabase/server'
import { createPublicClient } from '@/lib/supabase/public'
import type { Database } from '@/lib/supabase/database.types'
import { mapBusinessListRowToApp } from '@/lib/supabase/map-business'
import type { Business as AppBusiness } from '@/lib/types'

export type Business = Database['public']['Tables']['businesses']['Row']
export type BusinessInsert = Database['public']['Tables']['businesses']['Insert']
export type BusinessUpdate = Database['public']['Tables']['businesses']['Update']

export interface BusinessSearchParams {
  query?: string
  categoryId?: string
  subcategoryId?: string
  cityId?: string
  priceLevels?: number[]
  page?: number
  pageSize?: number
}

/** Public search over published businesses, mirroring the current mock-data filters. */
export async function searchPublishedBusinesses(params: BusinessSearchParams) {
  const supabase = await createClient()
  const page = params.page ?? 1
  const pageSize = params.pageSize ?? 20
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let q = supabase
    .from('businesses')
    .select('*', { count: 'exact' })
    .eq('status', 'published')

  if (params.categoryId) q = q.eq('category_id', params.categoryId)
  if (params.subcategoryId) q = q.eq('subcategory_id', params.subcategoryId)
  if (params.cityId) q = q.eq('city_id', params.cityId)
  if (params.priceLevels?.length) q = q.in('price_level', params.priceLevels)
  if (params.query) q = q.textSearch('search_vector', params.query, { type: 'websearch' })

  const { data, error, count } = await q.order('is_featured', { ascending: false }).order('avg_rating', { ascending: false }).range(from, to)
  if (error) throw error
  return { businesses: data ?? [], total: count ?? 0 }
}

/**
 * Full detail payload for a business's public profile page. Fetched as
 * separate queries (rather than deep PostgREST embeds) to keep this file's
 * types simple and independent of hand-maintained FK relationship metadata.
 */
export async function getBusinessBySlug(slug: string) {
  const supabase = await createClient()

  const { data: business, error } = await supabase.from('businesses').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  if (!business) return null

  const [category, subcategory, city, hours, images, sections, offerings, specials, posts, businessFilters] =
    await Promise.all([
      supabase.from('categories').select('*').eq('id', business.category_id).single(),
      business.subcategory_id
        ? supabase.from('categories').select('*').eq('id', business.subcategory_id).single()
        : Promise.resolve({ data: null }),
      business.city_id ? supabase.from('cities').select('*').eq('id', business.city_id).single() : Promise.resolve({ data: null }),
      supabase.from('business_hours').select('*').eq('business_id', business.id).order('day_of_week'),
      supabase.from('business_images').select('*').eq('business_id', business.id).order('sort_order'),
      supabase.from('business_offering_sections').select('*').eq('business_id', business.id).order('sort_order'),
      supabase.from('business_offerings').select('*').eq('business_id', business.id).order('sort_order'),
      supabase.from('business_specials').select('*').eq('business_id', business.id),
      supabase.from('business_posts').select('*').eq('business_id', business.id).order('published_at', { ascending: false }),
      supabase.from('business_filters').select('filter_id').eq('business_id', business.id),
    ])

  const filterIds = (businessFilters.data ?? []).map((row) => row.filter_id)
  const { data: filters } = filterIds.length
    ? await supabase.from('filters').select('*').in('id', filterIds)
    : { data: [] }

  return {
    business,
    category: category.data,
    subcategory: subcategory.data,
    city: city.data,
    hours: hours.data ?? [],
    images: images.data ?? [],
    offeringSections: (sections.data ?? []).map((section) => ({
      ...section,
      offerings: (offerings.data ?? []).filter((offering) => offering.section_id === section.id),
    })),
    unsectionedOfferings: (offerings.data ?? []).filter((offering) => !offering.section_id),
    specials: specials.data ?? [],
    posts: posts.data ?? [],
    filters: filters ?? [],
  }
}

/** All businesses (any status) owned/managed by the given profile — for the owner dashboard. */
export async function getBusinessesForOwner(profileId: string) {
  const supabase = await createClient()
  const { data: ownerRows, error: ownerError } = await supabase
    .from('business_owners')
    .select('business_id, role')
    .eq('profile_id', profileId)
  if (ownerError) throw ownerError
  if (!ownerRows?.length) return []

  const businessIds = ownerRows.map((row) => row.business_id)
  const { data: businessRows, error: businessError } = await supabase
    .from('businesses')
    .select('*')
    .in('id', businessIds)
  if (businessError) throw businessError

  const roleByBusinessId = new Map(ownerRows.map((row) => [row.business_id, row.role]))
  return (businessRows ?? []).map((business) => ({
    role: roleByBusinessId.get(business.id) ?? 'owner',
    business,
  }))
}

/**
 * All published businesses mapped into the frontend `Business` shape, for
 * use alongside the bundled mock data on the home/search pages while real
 * listings are still being onboarded.
 */
async function getPublishedBusinessesForAppUncached(limit = 60): Promise<AppBusiness[]> {
  // Cookie-free: this only ever reads `status = 'published'` rows (same for
  // every visitor), so it must not force the calling route into dynamic
  // per-request rendering (see lib/supabase/public.ts).
  const supabase = createPublicClient()
  const { data: rows, error } = await supabase
    .from('businesses')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('avg_rating', { ascending: false })
    .limit(limit)
  if (error) throw error
  if (!rows?.length) return []

  const businessIds = rows.map((r) => r.id)
  const categoryIds = [...new Set(rows.map((r) => r.category_id))]
  const cityIds = [...new Set(rows.map((r) => r.city_id).filter((id): id is string => Boolean(id)))]

  const [categoryRes, cityRes, hoursRes] = await Promise.all([
    supabase.from('categories').select('*').in('id', categoryIds),
    cityIds.length ? supabase.from('cities').select('*').in('id', cityIds) : Promise.resolve({ data: [] }),
    supabase.from('business_hours').select('*').in('business_id', businessIds),
  ])

  const categoryById = new Map((categoryRes.data ?? []).map((c) => [c.id, c]))
  const cityById = new Map((cityRes.data ?? []).map((c) => [c.id, c]))
  const hoursByBusiness = new Map<string, Database['public']['Tables']['business_hours']['Row'][]>()
  for (const h of hoursRes.data ?? []) {
    const list = hoursByBusiness.get(h.business_id) ?? []
    list.push(h)
    hoursByBusiness.set(h.business_id, list)
  }

  return rows.map((row) =>
    mapBusinessListRowToApp(
      row,
      categoryById.get(row.category_id) ?? null,
      row.city_id ? cityById.get(row.city_id) ?? null : null,
      hoursByBusiness.get(row.id) ?? [],
    ),
  )
}

/** Cached per-request so the root layout and page-level fetches don't double-query. */
export const getPublishedBusinessesForApp = cache(getPublishedBusinessesForAppUncached)

/**
 * Real (live) businesses first, followed by the bundled demo listings.
 * Temporary bridge while the catalog transitions away from mock data —
 * remove the mock spread once every category has real listings.
 */
export const getMixedBusinessesForApp = cache(async (limit = 60): Promise<AppBusiness[]> => {
  const real = await getPublishedBusinessesForApp(limit).catch(() => [])
  return [...real, ...mockBusinesses]
})

/** All businesses (any status) — for the admin moderation queue. */
export async function getBusinessesForAdmin(status?: Database['public']['Tables']['businesses']['Row']['status']) {
  const supabase = await createClient()
  let q = supabase.from('businesses').select('*, category:categories!businesses_category_id_fkey(name)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}
