import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Archive, Eye, Send } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EditListingForms } from '@/components/dashboard/edit-listing-forms'
import { createClient } from '@/lib/supabase/server'
import { getFiltersForCategory } from '@/lib/supabase/queries/categories'

import { archiveListing, submitForReview } from '../actions'

async function getListing(id: string) {
  const supabase = await createClient()
  const { data: business } = await supabase.from('businesses').select('*').eq('id', id).single()
  if (!business) return null

  const [hoursRes, imagesRes, sectionsRes, offeringsRes, specialsRes, postsRes, filtersRes, citiesRes] =
    await Promise.all([
      supabase.from('business_hours').select('*').eq('business_id', id).order('day_of_week'),
      supabase.from('business_images').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('business_offering_sections').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('business_offerings').select('*').eq('business_id', id).order('sort_order'),
      supabase.from('business_specials').select('*').eq('business_id', id).order('created_at', { ascending: false }),
      supabase.from('business_posts').select('*').eq('business_id', id).order('published_at', { ascending: false }),
      supabase.from('business_filters').select('filter_id').eq('business_id', id),
      supabase.from('cities').select('*').eq('is_active', true).order('name'),
    ])

  const availableFilters = await getFiltersForCategory(business.category_id)

  return {
    business,
    hours: hoursRes.data ?? [],
    images: imagesRes.data ?? [],
    sections: sectionsRes.data ?? [],
    offerings: offeringsRes.data ?? [],
    specials: specialsRes.data ?? [],
    posts: postsRes.data ?? [],
    selectedFilterIds: (filtersRes.data ?? []).map((row) => row.filter_id),
    availableFilters,
    cities: citiesRes.data ?? [],
  }
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const {
    business,
    hours,
    images,
    sections,
    offerings,
    specials,
    posts,
    selectedFilterIds,
    availableFilters,
    cities,
  } = listing

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/dashboard" className="text-sm text-muted-foreground hover:text-foreground">
              Overview
            </Link>
            <span className="text-muted-foreground">/</span>
            <h2 className="truncate text-base font-semibold tracking-tight">{business.name}</h2>
            <Badge variant={business.status === 'published' ? 'default' : 'outline'} className="capitalize">
              {business.status.replace('_', ' ')}
            </Badge>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <a href={`/business/${business.slug}`} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm">
              <Eye className="size-3.5" />
              Preview
            </Button>
          </a>
          {business.status === 'draft' && (
            <form action={submitForReview.bind(null, business.id)}>
              <Button type="submit" size="sm">
                <Send className="size-3.5" />
                Submit for review
              </Button>
            </form>
          )}
          {business.status !== 'archived' && (
            <form action={archiveListing.bind(null, business.id)}>
              <Button type="submit" variant="destructive" size="sm">
                <Archive className="size-3.5" />
                Archive
              </Button>
            </form>
          )}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-hidden">
        <EditListingForms
          business={business}
          hours={hours}
          images={images}
          sections={sections}
          offerings={offerings}
          specials={specials}
          posts={posts}
          selectedFilterIds={selectedFilterIds}
          availableFilters={availableFilters}
          cities={cities}
        />
      </div>
    </div>
  )
}
