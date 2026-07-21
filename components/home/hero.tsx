'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { Search, MapPin, ArrowRight, CornerDownLeft, Store } from 'lucide-react'
import { suggest } from '@/lib/search'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'

const heroImages = [
  { src: '/businesses/cafe.webp', label: 'Cafés' },
  { src: '/businesses/yoga.webp', label: 'Yoga & Wellness' },
  { src: '/businesses/bookstore.webp', label: 'Bookstores' },
  { src: '/businesses/restaurant.webp', label: 'Restaurants' },
]

const quickChips = ['restaurants', 'cafe', 'bakery', 'yoga', 'salon']

export function Hero() {
  const router = useRouter()
  const { categories, businesses } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const blurTimer = useRef<number | null>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const suggestions = useMemo(() => (q.trim() ? suggest(businesses, q, categories, 5) : []), [businesses, categories, q])

  useEffect(() => {
    setActiveIndex(-1)
  }, [q])

  useEffect(() => {
    if (activeIndex < 0) return
    listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  const go = (query: string) => {
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open || !suggestions.length) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => (i + 1 >= suggestions.length ? 0 : i + 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => (i - 1 < 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      router.push(`/business/${suggestions[activeIndex].id}`)
      setOpen(false)
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/40 to-background">
      <div className="mx-auto grid max-w-[88rem] items-center gap-4 px-4 pt-4 pb-6 sm:px-6 lg:grid-cols-2 lg:gap-10 lg:py-14">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <MapPin size={13} className="text-primary" /> Supporting local, one visit at a time
          </span>
          <h1 className="mt-3 font-serif text-3xl leading-[1.05] tracking-tight text-balance sm:text-4xl lg:mt-5 lg:text-5xl xl:text-6xl">
            Discover the best businesses in your neighborhood
          </h1>
          <p className="mx-auto mt-2.5 max-w-md text-base text-muted-foreground text-pretty lg:mx-0 lg:mt-4 lg:text-lg">
            Find local gems, read honest reviews, save your favorites, and message shops directly — all in one place.
          </p>

          <div className="relative mx-auto mt-5 max-w-lg lg:mx-0 lg:mt-7">
            <form
              onSubmit={(e) => {
                e.preventDefault()
                go(q)
              }}
              className="relative"
            >
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setOpen(true)
                }}
                onFocus={() => setOpen(true)}
                onBlur={() => {
                  blurTimer.current = window.setTimeout(() => setOpen(false), 150)
                }}
                onKeyDown={handleKeyDown}
                placeholder="Try 'coper fork' or 'flowers near me'"
                aria-label="Search local businesses"
                role="combobox"
                aria-expanded={open && suggestions.length > 0}
                aria-controls="hero-search-suggestions"
                aria-activedescendant={activeIndex >= 0 ? `hero-suggestion-${activeIndex}` : undefined}
                autoComplete="off"
                className="h-14 w-full rounded-2xl border bg-card pl-12 pr-28 text-base shadow-sm outline-none transition-colors focus:border-ring"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 inline-flex -translate-y-1/2 items-center gap-1.5 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                Search <ArrowRight size={15} />
              </button>
            </form>

            {open && suggestions.length > 0 && (
              <div
                ref={listRef}
                id="hero-search-suggestions"
                role="listbox"
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-popover shadow-lg"
                onMouseDown={() => {
                  if (blurTimer.current) window.clearTimeout(blurTimer.current)
                }}
              >
                {suggestions.map((b, i) => {
                  const cat = categories.find((c) => c.id === b.categoryId)
                  const isActive = i === activeIndex
                  return (
                    <Link
                      key={b.id}
                      href={`/business/${b.id}`}
                      data-index={i}
                      id={`hero-suggestion-${i}`}
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2.5 text-sm transition-colors',
                        isActive ? 'bg-accent' : 'hover:bg-accent',
                      )}
                    >
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={b.image || '/placeholder.svg'} alt="" fill className="object-cover" sizes="36px" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{b.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{cat?.name}</span>
                      </span>
                      <CornerDownLeft size={14} className="ml-auto text-muted-foreground" />
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-center gap-2 lg:mt-5 lg:justify-start">
            <span className="w-full text-sm text-muted-foreground lg:w-auto">Popular:</span>
            {quickChips.map((id) => {
              const cat = categories.find((c) => c.id === id)
              if (!cat) return null
              return (
                <Link
                  key={id}
                  href={`/search?category=${id}`}
                  className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                >
                  <CategoryIcon name={cat.icon} size={14} />
                  {cat.name}
                </Link>
              )
            })}
          </div>

          <div className="mt-4 hidden justify-center lg:mt-6 lg:flex lg:justify-start">
            <Link
              href="/become-owner"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
            >
              <Store size={15} />
              Own a business? List it free <ArrowRight size={13} />
            </Link>
          </div>
        </div>

        <div className="relative hidden lg:block">
          <div className="grid grid-cols-2 gap-4">
            {heroImages.map((img, i) => (
              <div
                key={img.src}
                className={`relative overflow-hidden rounded-3xl border shadow-sm ${
                  i % 2 === 0 ? 'aspect-[4/5]' : 'mt-8 aspect-[4/5]'
                }`}
              >
                <Image
                  src={img.src || '/placeholder.svg'}
                  alt={img.label}
                  fill
                  sizes="25vw"
                  // First tile is the LCP image on desktop; eager-load it.
                  priority={i === 0}
                  className="object-cover"
                />
                <span className="absolute bottom-3 left-3 rounded-full bg-background/85 px-3 py-1 text-xs font-medium backdrop-blur-sm">
                  {img.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
