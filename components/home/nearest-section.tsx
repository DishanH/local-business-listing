'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { ChevronDown, ChevronRight, Navigation } from 'lucide-react'
import { BusinessCard, BusinessListRow } from '@/components/business-card'
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
    <section className="border-y bg-secondary/25">
      <div className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-primary sm:text-sm sm:normal-case sm:font-medium">
              <Navigation size={14} /> Closest to you
            </span>
            <h2 className="mt-1 font-serif text-xl tracking-tight sm:text-2xl lg:text-3xl">Near {originLabel}</h2>
          </div>
          <Link
            href="/search?sort=nearest"
            className="inline-flex shrink-0 items-center gap-0.5 pt-1 text-sm font-medium text-primary hover:underline"
          >
            See all
            <ChevronRight size={15} />
          </Link>
        </div>

        {/* Mobile: vertical list */}
        <ul className="mt-4 divide-y sm:hidden">
          {shown.map((b, i) => (
            <li key={b.id}>
              <BusinessListRow business={b} priority={i === 0} />
            </li>
          ))}
        </ul>

        {/* Tablet+: grid */}
        <div className="mt-6 hidden gap-4 sm:grid sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
          {shown.map((b, i) => (
            <BusinessCard key={b.id} business={b} priority={i === 0} />
          ))}
        </div>

        {hasMore && (
          <div className="mt-6 flex justify-center sm:mt-8">
            <button
              type="button"
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="inline-flex h-11 items-center gap-2 rounded-full border bg-card px-5 text-sm font-medium transition-colors hover:border-primary hover:text-primary active:scale-[0.98]"
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
