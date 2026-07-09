'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useMemo, useRef, useState } from 'react'
import { Search, MapPin, ArrowRight, CornerDownLeft } from 'lucide-react'
import { businesses } from '@/lib/data'
import { suggest } from '@/lib/search'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'

const heroImages = [
  { src: '/businesses/cafe.png', label: 'Cafés' },
  { src: '/businesses/florist.png', label: 'Florists' },
  { src: '/businesses/bookstore.png', label: 'Bookstores' },
  { src: '/businesses/restaurant.png', label: 'Restaurants' },
]

const quickChips = ['restaurants', 'cafe', 'bakery', 'yoga', 'salon']

export function Hero() {
  const router = useRouter()
  const { categories } = useStore()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const blurTimer = useRef<number | null>(null)

  const suggestions = useMemo(() => (q.trim() ? suggest(businesses, q, categories, 5) : []), [q])

  const go = (query: string) => {
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  return (
    <section className="relative overflow-hidden border-b bg-gradient-to-b from-accent/40 to-background">
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:py-20">
        <div>
          <span className="inline-flex items-center gap-1.5 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <MapPin size={13} className="text-primary" /> Supporting local, one visit at a time
          </span>
          <h1 className="mt-5 font-serif text-4xl leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Discover the best businesses in your neighborhood
          </h1>
          <p className="mt-4 max-w-md text-lg text-muted-foreground text-pretty">
            Find local gems, read honest reviews, save your favorites, and message shops directly — all in one place.
          </p>

          <div className="relative mt-7 max-w-lg">
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
                placeholder="Try 'coper fork' or 'flowers near me'"
                aria-label="Search local businesses"
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
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border bg-popover shadow-lg"
                onMouseDown={() => {
                  if (blurTimer.current) window.clearTimeout(blurTimer.current)
                }}
              >
                {suggestions.map((b) => {
                  const cat = categories.find((c) => c.id === b.categoryId)
                  return (
                    <Link
                      key={b.id}
                      href={`/business/${b.id}`}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors hover:bg-accent"
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

          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
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
                <Image src={img.src || '/placeholder.svg'} alt={img.label} fill sizes="25vw" className="object-cover" />
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
