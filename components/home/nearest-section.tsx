'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronDown, Navigation } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { useStore } from '@/components/store-provider'
import { distanceMiles } from '@/lib/format'

const PAGE_SIZE = 10

export function NearestSection() {
  const { origin, originLabel, businesses } = useStore()
  const [visible, setVisible] = useState(PAGE_SIZE)

  const sorted = useMemo(
    () => [...businesses].sort((a, b) => distanceMiles(origin, a) - distanceMiles(origin, b)),
    [businesses, origin],
  )

  const shown = sorted.slice(0, visible)
  const hasMore = shown.length < sorted.length

  return (
    <section className="border-y bg-secondary/30">
      <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Navigation size={15} /> Closest to you
            </span>
            <h2 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Nearest {originLabel}</h2>
            <p className="mt-1 text-muted-foreground">
              Change your location in the top bar to see what&apos;s around you.
            </p>
          </div>
          <Link
            href="/search?sort=nearest"
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            See more
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
      </div>
    </section>
  )
}
