import { Suspense } from 'react'
import { Hero } from '@/components/home/hero'
import { CategoriesSection } from '@/components/home/categories-section'
import { NearestSection } from '@/components/home/nearest-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { ListBusinessCta } from '@/components/home/list-business-cta'

// ISR: Revalidate homepage every 15 minutes
export const revalidate = 900

function FeaturedSectionSkeleton() {
  return (
    <section className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="h-8 w-64 animate-pulse rounded-lg bg-muted" />
          <div className="mt-2 h-5 w-96 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={i} className="animate-pulse overflow-hidden rounded-2xl border">
            <div className="aspect-[4/3] bg-muted" />
            <div className="space-y-2 p-4">
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

      <CategoriesSection />

      <NearestSection />

      <Suspense fallback={<FeaturedSectionSkeleton />}>
        <FeaturedSection />
      </Suspense>

      <ListBusinessCta />
    </>
  )
}
