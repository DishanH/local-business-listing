'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'

export function CategoriesSection() {
  const { categories, businesses } = useStore()

  if (categories.length === 0) return null

  return (
    <section className="mx-auto max-w-[88rem] px-4 py-8 sm:px-6 sm:py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Browse by category</h2>
          <p className="mt-1 text-muted-foreground">Jump straight to the kind of place you&apos;re looking for.</p>
        </div>
        <Link
          href="/search"
          className="hidden shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline sm:inline-flex"
        >
          See all <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5">
        {categories.map((c) => {
          const count = businesses.filter((b) => b.categoryId === c.id).length
          return (
            <Link
              key={c.id}
              href={`/search?category=${c.id}`}
              className="group flex items-center gap-3 rounded-2xl border border-border/80 bg-card px-3.5 py-3.5 transition-colors hover:border-primary/40 hover:bg-accent/40"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <CategoryIcon name={c.icon} size={20} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-tight">{c.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {count > 0 ? `${count} ${count === 1 ? 'place' : 'places'}` : 'Explore'}
                </span>
              </span>
              <ArrowRight
                size={14}
                className="shrink-0 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
              />
            </Link>
          )
        })}
      </div>
    </section>
  )
}
