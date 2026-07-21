'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, ChevronDown, Crosshair, MapPin, Search } from 'lucide-react'
import { toast } from 'sonner'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useStore } from '@/components/store-provider'
import { nearestCity, originAreaLabel } from '@/lib/location'
import { cn } from '@/lib/utils'
import type { City } from '@/lib/types'

function normalize(s: string) {
  return s.toLowerCase().trim()
}

function CityPickerPanel({ onClose }: { onClose: () => void }) {
  const { origin, setOrigin, cities } = useStore()
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const [locating, setLocating] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const selectedCity = nearestCity(origin.lat, origin.lng, cities)

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return cities
    return cities.filter((c) => normalize(c.name).includes(q))
  }, [cities, query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  useEffect(() => {
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [])

  useEffect(() => {
    const item = listRef.current?.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [activeIndex])

  function choose(city: City) {
    setOrigin(city.lat, city.lng)
    onClose()
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (filtered.length) setActiveIndex((i) => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (filtered.length) setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const pick = filtered[activeIndex]
      if (pick) choose(pick)
    }
  }

  function useMyLocation() {
    if (!('geolocation' in navigator)) {
      toast.error("Your browser doesn't support location detection.")
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocating(false)
        choose(nearestCity(pos.coords.latitude, pos.coords.longitude, cities))
      },
      () => {
        setLocating(false)
        toast.error("Couldn't access your location. Pick a city below instead.")
      },
      { timeout: 8000 },
    )
  }

  return (
    <div className="w-[min(calc(100vw-1.5rem),20rem)] sm:w-80">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Choose your area</p>
        <p className="text-xs text-muted-foreground">Search or pick a town to browse nearby listings</p>
      </div>

      <div className="border-b border-border p-2">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search towns..."
            aria-label="Search towns"
            className="h-10 w-full rounded-xl border border-transparent bg-secondary/60 pl-9 pr-3 text-sm outline-none transition-colors focus:border-ring focus:bg-background"
          />
        </div>
      </div>

      <div className="p-2">
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm font-medium text-primary transition-colors hover:bg-accent disabled:opacity-60"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <Crosshair size={15} className={cn(locating && 'animate-spin')} />
          </span>
          {locating ? 'Finding you...' : 'Use my current location'}
        </button>
      </div>

      <ul ref={listRef} role="listbox" aria-label="Towns" className="max-h-64 overflow-y-auto p-2 pt-0">
        {filtered.length === 0 ? (
          <li className="px-2.5 py-6 text-center text-sm text-muted-foreground">No towns match &ldquo;{query}&rdquo;</li>
        ) : (
          filtered.map((city, i) => {
            const isSelected = city.id === selectedCity.id
            const isActive = i === activeIndex
            return (
              <li key={city.id} data-index={i} role="option" aria-selected={isSelected}>
                <button
                  type="button"
                  onClick={() => choose(city)}
                  onMouseEnter={() => setActiveIndex(i)}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2.5 text-left text-sm transition-colors',
                    isActive ? 'bg-accent' : 'hover:bg-accent/60',
                  )}
                >
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-muted-foreground">
                    <MapPin size={14} />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-medium">{city.name}</span>
                  {isSelected && <Check size={16} className="shrink-0 text-primary" />}
                </button>
              </li>
            )
          })
        )}
      </ul>
    </div>
  )
}

interface LocationMenuProps {
  className?: string
}

export function LocationMenu({ className }: LocationMenuProps) {
  const { origin, cities } = useStore()
  const [open, setOpen] = useState(false)
  const label = originAreaLabel(origin.lat, origin.lng, cities)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex max-w-[9.5rem] items-center gap-1.5 rounded-full bg-secondary/60 px-2.5 py-1.5 text-xs font-medium transition-colors hover:bg-secondary sm:max-w-[11rem] sm:px-3 sm:py-2 sm:text-sm',
          className,
        )}
        aria-label={`Location: ${label}. Change location`}
      >
        <MapPin size={15} className="shrink-0 text-primary sm:size-4" />
        <span className="min-w-0 truncate">{label}</span>
        <ChevronDown size={13} className="shrink-0 text-muted-foreground sm:size-3.5" />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="p-0">
        <CityPickerPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
