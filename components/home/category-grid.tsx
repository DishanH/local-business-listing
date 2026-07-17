'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'
import type { Business } from '@/lib/types'
import { useState, useRef } from 'react'

export function CategoryGrid({ businesses, categories }: { businesses: Business[], categories: Awaited<ReturnType<typeof getAppCategories>> }) {
  const [speed, setSpeed] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left
    const containerWidth = rect.width
    // Calculate speed based on mouse position (1x to 3x)
    const newSpeed = 1 + (x / containerWidth) * 2
    setSpeed(newSpeed)
  }

  const handleMouseLeave = () => {
    setSpeed(1)
  }

  return (
    <section className="py-10">
      <div className="mx-auto flex max-w-[88rem] items-end justify-between gap-4 px-4 sm:px-6">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">Browse by category</h2>
        <Link
          href="/search"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all <ArrowRight size={13} />
        </Link>
      </div>

      <div
        ref={containerRef}
        className="mt-4 w-full overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div 
          className="flex gap-2.5 px-4 pb-1 will-change-transform sm:px-6"
          style={{
            animation: `scroll-left-infinite ${40 / speed}s linear infinite`
          }}
        >
          {[...categories, ...categories, ...categories].map((c, index) => {
            const count = businesses.filter((b) => b.categoryId === c.id).length
            return (
              <Link
                key={`${c.id}-${index}`}
                href={`/search?category=${c.id}`}
                className="group flex shrink-0 items-center gap-2.5 rounded-full border bg-card px-3.5 py-2 mt-1 transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
              >
                <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <CategoryIcon name={c.icon} size={16} />
                </span>
                <span className="whitespace-nowrap text-sm font-medium">{c.name}</span>
                {count > 0 && (
                  <span className="whitespace-nowrap text-xs text-muted-foreground">{count}</span>
                )}
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
