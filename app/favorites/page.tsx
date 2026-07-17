'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Heart, Search, X } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { CategoryIcon } from '@/components/category-icon'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'
import { useStore } from '@/components/store-provider'
import { distanceMiles } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Sort = 'saved' | 'name' | 'rating' | 'nearest'

const sortLabels: Record<Sort, string> = {
  saved: 'Recently saved',
  name: 'Name (A–Z)',
  rating: 'Top rated',
  nearest: 'Nearest',
}

function FavoritesSkeleton() {
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex flex-col overflow-hidden rounded-2xl border bg-card">
          <div className="aspect-[4/3] animate-pulse bg-muted" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

function PageHeader({ count }: { count: number }) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-[color:var(--destructive)]">
        <Heart size={20} fill="currentColor" />
      </span>
      <div className="min-w-0 flex-1">
        <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Your favorites</h1>
        <p className="text-sm text-muted-foreground">
          {count} saved {count === 1 ? 'place' : 'places'}
        </p>
      </div>
    </div>
  )
}

export default function FavoritesPage() {
  const { user, authLoading, favorites, favoritesLoading, businesses, categories, origin, getRating } = useStore()
  const [query, setQuery] = useState('')
  const [categoryId, setCategoryId] = useState('all')
  const [sort, setSort] = useState<Sort>('saved')

  const saved = useMemo(
    () => favorites.map((id) => businesses.find((b) => b.id === id)).filter((b): b is NonNullable<typeof b> => !!b),
    [favorites, businesses],
  )

  const savedCategories = useMemo(() => {
    const ids = new Set(saved.map((b) => b.categoryId))
    return categories.filter((c) => ids.has(c.id))
  }, [saved, categories])

  const filtered = useMemo(() => {
    let list = saved
    if (categoryId !== 'all') list = list.filter((b) => b.categoryId === categoryId)
    if (query.trim()) {
      const q = query.trim().toLowerCase()
      list = list.filter((b) => b.name.toLowerCase().includes(q) || b.tagline?.toLowerCase().includes(q))
    }

    const sorted = [...list]
    if (sort === 'name') {
      sorted.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'rating') {
      sorted.sort((a, b) => (b.rating ?? getRating(b.id)).avg - (a.rating ?? getRating(a.id)).avg)
    } else if (sort === 'nearest') {
      sorted.sort((a, b) => distanceMiles(origin, a) - distanceMiles(origin, b))
    }
    return sorted
  }, [saved, categoryId, query, sort, origin, getRating])

  if (authLoading || (user && favoritesLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader count={0} />
        <FavoritesSkeleton />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <PageHeader count={0} />
        <div className="mt-8">
          <SignInPrompt message="Sign in to save favorites and access them from any device." />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <PageHeader count={saved.length} />

      {saved.length > 0 ? (
        <>
          <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card/60 p-2 shadow-sm">
            <div className="relative min-w-0 flex-1">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search your favorites..."
                aria-label="Search your favorites"
                className="h-9 w-full rounded-full border-none bg-transparent pl-9 pr-8 text-sm outline-none"
              />
              {query && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

            <Select value={sort} onValueChange={(v) => v && setSort(v as Sort)}>
              <SelectTrigger className="h-9 shrink-0 gap-1.5 rounded-full border-none bg-transparent px-2.5 text-sm shadow-none sm:px-3">
                <SelectValue />
              </SelectTrigger>
              <SelectContent align="end">
                {(Object.keys(sortLabels) as Sort[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {sortLabels[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {savedCategories.length > 1 && (
            <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
              <button
                type="button"
                onClick={() => setCategoryId('all')}
                className={cn(
                  'inline-flex shrink-0 items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm',
                  categoryId === 'all' ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
                )}
              >
                All
              </button>
              {savedCategories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setCategoryId(c.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm',
                    categoryId === c.id ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
                  )}
                >
                  <CategoryIcon name={c.icon} size={13} />
                  {c.name}
                </button>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
              {filtered.map((b) => (
                <BusinessCard key={b.id} business={b} />
              ))}
            </div>
          ) : (
            <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 py-14 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
                <Search size={20} />
              </div>
              <h3 className="mt-3 font-serif text-lg">No matches in your favorites</h3>
              <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                Try a different search term or category.
              </p>
              <button
                type="button"
                onClick={() => {
                  setQuery('')
                  setCategoryId('all')
                }}
                className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
              >
                Clear filters
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Heart size={24} />
          </div>
          <h3 className="mt-4 font-serif text-xl">No favorites yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any real listing to save it here. Demo listings are not saved to your account.
          </p>
          <Link
            href="/search"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Discover businesses
          </Link>
        </div>
      )}
    </div>
  )
}
