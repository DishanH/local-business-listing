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
          <h2 className="font-serif text-xl tracking-tight sm:text-2xl lg:text-3xl">Browse by category</h2>
          <p className="mt-1 text-sm text-muted-foreground">Tap a category to see places near you</p>
        </div>
        <Link
          href="/search"
          className="inline-flex shrink-0 items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          All <ArrowRight size={15} />
        </Link>
      </div>

      {/* Mobile: horizontal snap scroll with large touch targets */}
      <div className="mt-5 flex gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:hidden [&::-webkit-scrollbar]:hidden">
        {categories.map((c) => {
          const count = businesses.filter((b) => b.categoryId === c.id).length
          return (
            <Link
              key={c.id}
              href={`/search?category=${c.id}`}
              className="flex w-[5.5rem] shrink-0 snap-start flex-col items-center gap-2 active:scale-95"
            >
              <span className="flex size-[4.5rem] items-center justify-center rounded-2xl border border-border/80 bg-card shadow-sm transition-colors active:border-primary/40 active:bg-accent/50">
                <CategoryIcon name={c.icon} size={26} className="text-primary" />
              </span>
              <span className="w-full text-center text-xs font-medium leading-tight">{c.name}</span>
              {count > 0 && (
                <span className="-mt-1 text-[10px] text-muted-foreground">{count}</span>
              )}
            </Link>
          )
        })}
      </div>

      {/* Tablet+: responsive grid */}
      <div className="mt-6 hidden gap-2.5 sm:grid sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {categories.map((c) => {
          const count = businesses.filter((b) => b.categoryId === c.id).length
          return (
            <Link
              key={c.id}
              href={`/search?category=${c.id}`}
              className="group flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-border/80 bg-card px-3.5 py-3 transition-colors hover:border-primary/40 hover:bg-accent/30 active:scale-[0.99]"
            >
              <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
                <CategoryIcon name={c.icon} size={22} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-semibold leading-tight">{c.name}</span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {count > 0 ? `${count} places` : 'Explore'}
                </span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
