'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Navigation } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { useStore } from '@/components/store-provider'
import { businesses } from '@/lib/data'
import { distanceMiles } from '@/lib/format'

export function NearestSection() {
  const { origin, originLabel } = useStore()

  const nearest = useMemo(
    () =>
      [...businesses]
        .sort((a, b) => distanceMiles(origin, a) - distanceMiles(origin, b))
        .slice(0, 4),
    [origin],
  )

  return (
    <section className="border-y bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              <Navigation size={15} /> Closest to you
            </span>
            <h2 className="mt-1 font-serif text-2xl tracking-tight sm:text-3xl">Nearest {originLabel}</h2>
            <p className="mt-1 text-muted-foreground">
              Change your location on the map in the top bar to see what&apos;s around you.
            </p>
          </div>
          <Link
            href="/search?sort=nearest"
            className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block"
          >
            See more
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {nearest.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      </div>
    </section>
  )
}
