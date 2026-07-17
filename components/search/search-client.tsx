'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ArrowUpDown, MapPin, Search, X, ChevronDown } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'
import { fuzzySearch } from '@/lib/search'
import { getSubcategories, matchesSubcategory } from '@/lib/subcategories'
import { distanceMiles, getOpenStatus } from '@/lib/format'
import { cn } from '@/lib/utils'
import { FiltersPopover } from '@/components/search/search-filters'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Sort = 'relevance' | 'nearest' | 'rating' | 'name'

const PAGE_SIZE = 12

const sortLabels: Record<Sort, string> = {
  relevance: 'Best match',
  nearest: 'Nearest',
  rating: 'Top rated',
  name: 'Name (A–Z)',
}

export function SearchClient() {
  const router = useRouter()
  const params = useSearchParams()
  const { getRating, origin, categories, businesses, cities } = useStore()

  const [query, setQuery] = useState(params.get('q') ?? '')
  const [category, setCategory] = useState(params.get('category') ?? 'all')
  const [subcategory, setSubcategory] = useState(params.get('sub') ?? 'all')
  const [city, setCity] = useState(params.get('city') ?? 'all')
  const [sort, setSort] = useState<Sort>((params.get('sort') as Sort) ?? 'relevance')
  const [openNow, setOpenNow] = useState(false)
  const [priceLevels, setPriceLevels] = useState<string[]>([])
  const [visiblePages, setVisiblePages] = useState(1)

  const activeCategory = categories.find((c) => c.id === category)
  const activeCity = cities.find((c) => c.id === city)
  const subcategories = category !== 'all' ? getSubcategories(category) : []
  const activeSub = subcategories.find((s) => s.id === subcategory)

  const results = useMemo(() => {
    let list = fuzzySearch(businesses, query, categories).map((r) => ({
      business: r.business,
      score: r.score,
    }))

    if (category !== 'all') list = list.filter((r) => r.business.categoryId === category)
    if (subcategory !== 'all' && activeSub) {
      list = list.filter((r) => matchesSubcategory(r.business, activeSub))
    }
    if (city !== 'all') list = list.filter((r) => r.business.city === city)
    if (openNow) list = list.filter((r) => getOpenStatus(r.business).open)
    if (priceLevels.length > 0) {
      list = list.filter((r) => priceLevels.includes(String(r.business.priceLevel)))
    }

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
  }, [businesses, query, category, subcategory, activeSub, city, openNow, priceLevels, sort, origin, getRating])

  useEffect(() => {
    setVisiblePages(1)
  }, [query, category, subcategory, city, openNow, priceLevels, sort])

  const visibleResults = results.slice(0, visiblePages * PAGE_SIZE)
  const hasMore = visibleResults.length < results.length

  // Build the URL from the *full* current state (plus any overrides) so that
  // changing one filter never accidentally drops another (e.g. picking a
  // category must keep the selected city). Overrides use the passed value
  // directly since the corresponding setState hasn't flushed yet.
  const updateUrl = useCallback(
    (next: Partial<{ q: string; category: string; sub: string; city: string; sort: string }>) => {
      const merged = { q: query, category, sub: subcategory, city, sort, ...next }
      const sp = new URLSearchParams()
      if (merged.q.trim()) sp.set('q', merged.q.trim())
      if (merged.category && merged.category !== 'all') sp.set('category', merged.category)
      if (merged.sub && merged.sub !== 'all') sp.set('sub', merged.sub)
      if (merged.city && merged.city !== 'all') sp.set('city', merged.city)
      if (merged.sort && merged.sort !== 'relevance') sp.set('sort', merged.sort)
      const qs = sp.toString()
      router.replace(qs ? `/search?${qs}` : '/search', { scroll: false })
    },
    [router, query, category, subcategory, city, sort],
  )

  const togglePrice = (value: string) => {
    setPriceLevels((prev) => (prev.includes(value) ? prev.filter((p) => p !== value) : [...prev, value]))
  }

  const clearFilters = () => {
    setPriceLevels([])
    setOpenNow(false)
  }

  const clearAll = () => {
    setCategory('all')
    setSubcategory('all')
    setCity('all')
    clearFilters()
    setSort('relevance')
    setQuery('')
    router.replace('/search', { scroll: false })
  }

  return (
    <div className="mx-auto max-w-[88rem] px-4 py-6 sm:px-6 sm:py-8">
      {activeCategory ? (
        <div className="flex items-center gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CategoryIcon name={activeCategory.icon} size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <h1 className="font-serif text-xl tracking-tight sm:text-2xl">{activeCategory.name}</h1>
            <p className="text-sm text-muted-foreground">
              {results.length} {results.length === 1 ? 'place' : 'places'} found
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setCategory('all')
              setSubcategory('all')
              updateUrl({ category: 'all', sub: 'all' })
            }}
            className="shrink-0 text-sm font-medium text-muted-foreground hover:text-primary"
          >
            Change
          </button>
        </div>
      ) : (
        <div>
          <h1 className="font-serif text-2xl tracking-tight sm:text-3xl">Browse local businesses</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">{results.length} places near you</p>
        </div>
      )}

      {/* Toolbar: search + sort + filters */}
      <div className="mt-4 flex items-center gap-2 rounded-2xl border border-border bg-card/60 p-2 shadow-sm">
        <div className="relative min-w-0 flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              updateUrl({ q: e.target.value })
            }}
            placeholder="Search in results..."
            aria-label="Search businesses"
            className="h-9 w-full rounded-full border-none bg-transparent pl-9 pr-8 text-sm outline-none"
          />
          {query && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={() => {
                setQuery('')
                updateUrl({ q: '' })
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X size={15} />
            </button>
          )}
        </div>

        <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

        <Select
          value={city}
          onValueChange={(v) => {
            if (!v) return
            setCity(v)
            updateUrl({ city: v })
          }}
        >
          <SelectTrigger className="h-9 shrink-0 gap-1.5 rounded-full border-none bg-transparent px-2.5 text-sm shadow-none sm:px-3">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="max-w-[7rem] truncate">
              <SelectValue placeholder="All cities" />
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            <SelectItem value="all">All cities</SelectItem>
            {cities.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="h-6 w-px shrink-0 bg-border" aria-hidden="true" />

        <Select
          value={sort}
          onValueChange={(v) => {
            if (!v) return
            setSort(v as Sort)
            updateUrl({ sort: v })
          }}
        >
          <SelectTrigger className="h-9 shrink-0 gap-1.5 rounded-full border-none bg-transparent px-2.5 text-sm shadow-none sm:px-3">
            <ArrowUpDown size={14} className="text-muted-foreground" />
            <span className="hidden sm:inline">
              <SelectValue />
            </span>
          </SelectTrigger>
          <SelectContent align="end">
            {(Object.keys(sortLabels) as Sort[]).map((s) => (
              <SelectItem key={s} value={s}>
                {sortLabels[s]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <FiltersPopover
          priceLevels={priceLevels}
          onTogglePrice={togglePrice}
          openNow={openNow}
          onToggleOpenNow={() => setOpenNow((v) => !v)}
          onClear={clearFilters}
        />
      </div>

      {/* Category / subcategory chips */}
      {category === 'all' ? (
        query.trim() ? (
          <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setCategory(c.id)
                  setSubcategory('all')
                  updateUrl({ category: c.id, sub: 'all' })
                }}
                className="inline-flex shrink-0 items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-xs font-medium transition-colors hover:border-primary sm:px-3 sm:py-1.5 sm:text-sm"
              >
                <CategoryIcon name={c.icon} size={13} />
                {c.name}
              </button>
            ))}
          </div>
        ) : (
          <div className="mt-5">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Browse by category
            </h2>
            <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
              {categories.map((c) => {
                const count = results.filter((b) => b.categoryId === c.id).length
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setCategory(c.id)
                      setSubcategory('all')
                      updateUrl({ category: c.id, sub: 'all' })
                    }}
                    className="group flex flex-col items-start gap-2 rounded-2xl border bg-card p-3.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary hover:shadow-sm"
                  >
                    <span className="flex size-10 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <CategoryIcon name={c.icon} size={20} />
                    </span>
                    <span className="text-sm font-medium leading-tight">{c.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {count} {count === 1 ? 'place' : 'places'}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )
      ) : subcategories.length > 0 ? (
        <div className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
          <button
            type="button"
            onClick={() => {
              setSubcategory('all')
              updateUrl({ sub: 'all' })
            }}
            className={cn(
              'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm',
              subcategory === 'all' ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
            )}
          >
            All {activeCategory?.name}
          </button>
          {subcategories.map((sub) => (
            <button
              key={sub.id}
              type="button"
              onClick={() => {
                setSubcategory(sub.id)
                updateUrl({ sub: sub.id })
              }}
              className={cn(
                'inline-flex shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm',
                subcategory === sub.id ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
              )}
            >
              {sub.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Active filter tags */}
      {(priceLevels.length > 0 || openNow) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-medium text-muted-foreground">Active:</span>
          {openNow && (
            <span className="inline-flex items-center gap-1 rounded-full border border-primary bg-accent px-2.5 py-1 text-xs font-medium text-primary">
              Open now
              <button type="button" aria-label="Remove open now filter" onClick={() => setOpenNow(false)}>
                <X size={12} />
              </button>
            </span>
          )}
          {priceLevels
            .slice()
            .sort()
            .map((p) => (
              <span
                key={p}
                className="inline-flex items-center gap-1 rounded-full border border-primary bg-accent px-2.5 py-1 text-xs font-medium text-primary"
              >
                {'$'.repeat(Number(p))}
                <button type="button" aria-label={`Remove ${p} price filter`} onClick={() => togglePrice(p)}>
                  <X size={12} />
                </button>
              </span>
            ))}
          <button
            type="button"
            onClick={clearFilters}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Results */}
      <p className="mt-4 text-xs text-muted-foreground sm:text-sm">
        {results.length} {results.length === 1 ? 'result' : 'results'}
        {query.trim() ? (
          <>
            {' '}for <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>
          </>
        ) : null}
        {activeCity ? (
          <>
            {' '}in <span className="font-medium text-foreground">{activeCity.name}</span>
          </>
        ) : null}
      </p>

      {results.length > 0 ? (
        <>
          <div className="mt-3 grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-4">
            {visibleResults.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>

          {hasMore && (
            <div className="mt-8 flex flex-col items-center gap-2">
              <button
                type="button"
                onClick={() => setVisiblePages((p) => p + 1)}
                className="inline-flex items-center gap-2 rounded-full border bg-card px-5 py-2 text-sm font-medium transition-colors hover:border-primary hover:text-primary"
              >
                Show more
                <ChevronDown size={15} />
              </button>
              <p className="text-xs text-muted-foreground">
                {visibleResults.length} of {results.length}
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 py-14 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
            <Search size={20} />
          </div>
          <h3 className="mt-3 font-serif text-lg">No matches found</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Try different filters or broaden your search.
          </p>
          <button
            type="button"
            onClick={clearAll}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Clear all
          </button>
        </div>
      )}
    </div>
  )
}
