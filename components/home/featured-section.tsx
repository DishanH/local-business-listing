'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ArrowRight, ChevronDown } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { useStore } from '@/components/store-provider'

const PAGE_SIZE = 10

export function FeaturedSection() {
  const { businesses } = useStore()
  const [visible, setVisible] = useState(PAGE_SIZE)
  const featured = useMemo(() => businesses.filter((b) => b.featured), [businesses])

  if (featured.length === 0) return null

  const shown = featured.slice(0, visible)
  const hasMore = shown.length < featured.length

  return (
    <section className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
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

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
        {shown.map((b) => (
          <BusinessCard key={b.id} business={b} />
        ))}
      </div>

      {hasMore && (
        <div className="mt-8 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
          >
            Show more
            <ChevronDown size={15} />
          </button>
        </div>
      )}
    </section>
  )
}
