'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useMemo, useState } from 'react'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'
import { businesses, categories, cities } from '@/lib/data'
import { fuzzySearch } from '@/lib/search'
import { distanceMiles, getOpenStatus } from '@/lib/format'
import { cn } from '@/lib/utils'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Sort = 'relevance' | 'nearest' | 'rating' | 'name'

export function SearchClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { getRating, originCityId } = useStore()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? 'all')
  const [city, setCity] = useState(params.get('city') ?? 'all')
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) ?? 'relevance')
  const [openNow, setOpenNow] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const origin = cities.find((c) => c.id === originCityId) ?? cities[0]

  const results = useMemo(() => {
    // Fuzzy match on the query first (returns all with score 0 when empty).
    let list = fuzzySearch(businesses, query, categories).map((r) => ({
      business: r.business,
      score: r.score,
    }))

    if (category !== 'all') list = list.filter((r) => r.business.categoryId === category)
    if (city !== 'all') list = list.filter((r) => r.business.city === city)
    if (openNow) list = list.filter((r) => getOpenStatus(r.business).open)

    const sorted = [...list]
    if (sort === 'nearest') {
      sorted.sort((a, b) => distanceMiles(origin, a.business) - distanceMiles(origin, b.business))
    } else if (sort === 'rating') {
      sorted.sort((a, b) => getRating(b.business.id).avg - getRating(a.business.id).avg)
    } else if (sort === 'name') {
      sorted.sort((a, b) => a.business.name.localeCompare(b.business.name))
    } else if (query.trim()) {
      sorted.sort((a, b) => b.score - a.score)
    }
    return sorted.map((r) => r.business)
  }, [query, category, city, openNow, sort, origin, getRating])

  const updateUrl = useCallback(
    (next: Partial<{ q: string; category: string; city: string; sort: string }>) => {
      const sp = new URLSearchParams(params.toString())
      Object.entries(next).forEach(([k, v]) => {
        if (v && v !== 'all' && v !== 'relevance') sp.set(k, v)
        else sp.delete(k)
      })
      router.replace(sp.toString() ? `/search?${sp.toString()}` : '/search', { scroll: false })
    },
    [params, router],
  )

  const activeFilters = (category !== 'all' ? 1 : 0) + (city !== 'all' ? 1 : 0) + (openNow ? 1 : 0)

  const clearAll = () => {
    setCategory('all')
    setCity('all')
    setOpenNow(false)
    setSort('relevance')
    setQuery('')
    router.replace('/search', { scroll: false })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Browse local businesses</h1>
      <p className="mt-1 text-muted-foreground">
        Search by name — even with typos. We&apos;ll find the closest match.
      </p>

      {/* Search bar */}
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              updateUrl({ q: e.target.value })
            }}
            placeholder="Search e.g. 'coper fork', 'flowers', 'italian'"
            aria-label="Search businesses"
            className="h-12 w-full rounded-xl border bg-card pl-12 pr-10 text-base shadow-sm outline-none transition-colors focus:border-ring"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                updateUrl({ q: '' })
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={18} />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={() => setShowFilters((s) => !s)}
          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border bg-card px-4 text-sm font-medium sm:hidden"
        >
          <SlidersHorizontal size={16} />
          Filters{activeFilters > 0 ? ` (${activeFilters})` : ''}
        </button>
      </div>

      {/* Filters row */}
      <div className={cn('mt-4 flex-wrap items-center gap-3 sm:flex', showFilters ? 'flex' : 'hidden')}>
        <Select
          value={category}
          onValueChange={(v) => {
            setCategory(v)
            updateUrl({ category: v })
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg bg-card sm:w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={city}
          onValueChange={(v) => {
            setCity(v)
            updateUrl({ city: v })
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg bg-card sm:w-[150px]">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={sort}
          onValueChange={(v) => {
            setSort(v as Sort)
            updateUrl({ sort: v })
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-lg bg-card sm:w-[160px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="relevance">Best match</SelectItem>
            <SelectItem value="nearest">Nearest</SelectItem>
            <SelectItem value="rating">Top rated</SelectItem>
            <SelectItem value="name">Name (A–Z)</SelectItem>
          </SelectContent>
        </Select>

        <button
          type="button"
          onClick={() => setOpenNow((v) => !v)}
          aria-pressed={openNow}
          className={cn(
            'inline-flex h-10 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors',
            openNow ? 'border-primary bg-primary text-primary-foreground' : 'bg-card hover:border-primary',
          )}
        >
          Open now
        </button>

        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="inline-flex h-10 items-center gap-1 rounded-lg px-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <X size={15} /> Clear
          </button>
        )}
      </div>

      {/* Quick category chips */}
      <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
        <button
          type="button"
          onClick={() => {
            setCategory('all')
            updateUrl({ category: 'all' })
          }}
          className={cn(
            'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
            category === 'all' ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
          )}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => {
              setCategory(c.id)
              updateUrl({ category: c.id })
            }}
            className={cn(
              'inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors',
              category === c.id ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
            )}
          >
            <CategoryIcon name={c.icon} size={14} />
            {c.name}
          </button>
        ))}
      </div>

      {/* Results */}
      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {results.length} {results.length === 1 ? 'result' : 'results'}
          {query.trim() && (
            <>
              {' '}for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
            </>
          )}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {results.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Search size={24} />
          </div>
          <h3 className="mt-4 font-serif text-xl">No matches found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try a different spelling, broaden your filters, or clear them to see everything.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  )
}
