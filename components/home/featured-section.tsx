import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { businesses } from '@/lib/data'

export function FeaturedSection() {
  const featured = businesses.filter((b) => b.featured)

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Featured this week</h2>
          <p className="mt-1 text-muted-foreground">Hand-picked spots the community loves right now.</p>
        </div>
        <Link
          href="/search"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Explore all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {featured.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>
    </section>
  )
}
