import { Suspense } from 'react'
import { Hero } from '@/components/home/hero'
import { CitySection } from '@/components/home/city-section'
import { NearestSection } from '@/components/home/nearest-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { ListBusinessCta } from '@/components/home/list-business-cta'
import { getMixedBusinessesForApp } from '@/lib/supabase/queries/businesses'

// ISR: Revalidate homepage every 15 minutes
export const revalidate = 900

// Server component that fetches and renders CitySection
async function CitySectionServer() {
  const businesses = await getMixedBusinessesForApp(200)
  return <CitySection businesses={businesses} />
}

// Loading skeleton for CitySection
function CitySectionSkeleton() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-muted" />
      <div className="mt-2 h-5 w-80 animate-pulse rounded bg-muted" />
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="aspect-[4/3] animate-pulse rounded-2xl bg-muted" />
        ))}
      </div>
    </section>
  )
}

// Loading skeleton for FeaturedSection
function FeaturedSectionSkeleton() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border">
            <div className="aspect-[4/3] bg-muted" />
            <div className="p-4 space-y-2">
              <div className="h-5 w-3/4 rounded bg-muted" />
              <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default async function HomePage() {
  return (
    <>
      <Hero />

      <NearestSection />

      <Suspense fallback={<FeaturedSectionSkeleton />}>
        <FeaturedSection />
      </Suspense>

      <Suspense fallback={<CitySectionSkeleton />}>
        <CitySectionServer />
      </Suspense>

      <ListBusinessCta />
    </>
  )
}
