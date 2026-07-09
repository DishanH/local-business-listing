import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

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

  const { data: business, error } = await supabase.from('businesses').select('*').eq('slug', slug).single()
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

/** All businesses (any status) — for the admin moderation queue. */
export async function getBusinessesForAdmin(status?: Database['public']['Tables']['businesses']['Row']['status']) {
  const supabase = await createClient()
  let q = supabase.from('businesses').select('*, category:categories!businesses_category_id_fkey(name)').order('created_at', { ascending: false })
  if (status) q = q.eq('status', status)
  const { data, error } = await q
  if (error) throw error
  return data ?? []
}
