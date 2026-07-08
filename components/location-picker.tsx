'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronDown, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useStore } from '@/components/store-provider'
import { cities } from '@/lib/data'
import {
  mapBusinessDots,
  nearestCity,
  originAreaLabel,
  projectToMap,
  unprojectFromMap,
} from '@/lib/location'
import { cn } from '@/lib/utils'

const MAP_W = 360
const MAP_H = 220

function LocationMapPanel({ onClose }: { onClose: () => void }) {
  const { origin, setOrigin } = useStore()
  const svgRef = useRef<SVGSVGElement>(null)
  const [draft, setDraft] = useState(origin)

  useEffect(() => {
    setDraft(origin)
  }, [origin])

  const pin = projectToMap(draft, MAP_W, MAP_H)
  const label = originAreaLabel(draft.lat, draft.lng)
  const snappedCity = nearestCity(draft.lat, draft.lng)

  const pickFromEvent = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return
    const rect = svg.getBoundingClientRect()
    const x = ((clientX - rect.left) / rect.width) * MAP_W
    const y = ((clientY - rect.top) / rect.height) * MAP_H
    const clampedX = Math.max(12, Math.min(MAP_W - 12, x))
    const clampedY = Math.max(12, Math.min(MAP_H - 12, y))
    setDraft(unprojectFromMap(clampedX, clampedY, MAP_W, MAP_H))
  }, [])

  function handleApply() {
    setOrigin(draft.lat, draft.lng)
    onClose()
  }

  function snapToCity(cityId: string) {
    const city = cities.find((c) => c.id === cityId)
    if (city) setDraft({ lat: city.lat, lng: city.lng })
  }

  return (
    <div className="w-[min(calc(100vw-1.5rem),20rem)] sm:w-80">
      <div className="border-b border-border px-4 py-3">
        <p className="text-sm font-semibold">Choose your area</p>
        <p className="text-xs text-muted-foreground">Tap the map or pick a town</p>
      </div>

      <div className="p-3">
        <div className="overflow-hidden rounded-xl border border-border">
          <svg
            ref={svgRef}
            viewBox={`0 0 ${MAP_W} ${MAP_H}`}
            className="block w-full touch-none select-none"
            role="img"
            aria-label="Map to choose your location"
            onClick={(e) => pickFromEvent(e.clientX, e.clientY)}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId)
              pickFromEvent(e.clientX, e.clientY)
            }}
            onPointerMove={(e) => {
              if (e.buttons !== 1) return
              pickFromEvent(e.clientX, e.clientY)
            }}
          >
            <defs>
              <pattern id="loc-map-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="0.4"
                  className="text-border/60"
                />
              </pattern>
              <radialGradient id="loc-radius-fill" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
                <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
              </radialGradient>
            </defs>

            <rect width={MAP_W} height={MAP_H} className="fill-[#e8f0e6] dark:fill-[#1a2420]" />
            <rect width={MAP_W} height={MAP_H} fill="url(#loc-map-grid)" />
            <ellipse cx="65" cy="165" rx="50" ry="32" className="fill-[#b8d4e8]/70 dark:fill-[#1e3a4f]/50" />
            <ellipse cx="295" cy="45" rx="60" ry="36" className="fill-[#c5dcc0]/80 dark:fill-[#243828]/60" />
            <path
              d="M 0 110 Q 100 95 180 115 T 360 105"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              className="text-background/90 dark:text-foreground/15"
            />
            <circle cx={pin.x} cy={pin.y} r={44} fill="url(#loc-radius-fill)" />
            <circle
              cx={pin.x}
              cy={pin.y}
              r={44}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeDasharray="4 3"
              className="text-primary/50"
            />
            {mapBusinessDots.map((b, i) => {
              const p = projectToMap(b, MAP_W, MAP_H)
              return <circle key={i} cx={p.x} cy={p.y} r={2} className="fill-foreground/20" />
            })}
            {cities.map((city) => {
              const p = projectToMap(city, MAP_W, MAP_H)
              const active = city.id === snappedCity.id
              return (
                <g
                  key={city.id}
                  className="cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation()
                    snapToCity(city.id)
                  }}
                >
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={active ? 8 : 6}
                    className={cn(active ? 'fill-primary' : 'fill-foreground/30')}
                  />
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    className="fill-foreground text-[10px] font-semibold"
                    style={{ fontFamily: 'var(--font-sans)' }}
                  >
                    {city.name}
                  </text>
                </g>
              )
            })}
            <g transform={`translate(${pin.x}, ${pin.y})`} pointerEvents="none">
              <ellipse cx={0} cy={12} rx={7} ry={2.5} className="fill-foreground/15" />
              <path
                d="M 0 -16 C -7 -16 -11 -10 -11 -3 C -11 5 0 14 0 14 C 0 14 11 5 11 -3 C 11 -10 7 -16 0 -16 Z"
                className="fill-primary stroke-primary-foreground"
                strokeWidth="1.5"
              />
              <circle cx={0} cy={-5} r={3.5} className="fill-primary-foreground" />
            </g>
          </svg>
        </div>

        <p className="mt-2 flex items-center gap-1.5 text-xs">
          <Navigation size={13} className="text-primary" />
          Near <span className="font-semibold">{label}</span>
        </p>

        <div className="mt-2 flex flex-wrap gap-1.5">
          {cities.map((city) => (
            <button
              key={city.id}
              type="button"
              onClick={() => snapToCity(city.id)}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs font-medium transition-colors',
                snappedCity.id === city.id && Math.abs(draft.lat - city.lat) < 0.008
                  ? 'border-primary bg-accent text-primary'
                  : 'hover:border-primary',
              )}
            >
              {city.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 border-t border-border p-3">
        <Button variant="outline" size="sm" className="flex-1 rounded-lg" onClick={onClose}>
          Cancel
        </Button>
        <Button size="sm" className="flex-1 rounded-lg" onClick={handleApply}>
          Apply
        </Button>
      </div>
    </div>
  )
}

interface LocationMenuProps {
  className?: string
  /** Icon-only on small screens, label on md+ */
  responsive?: boolean
}

export function LocationMenu({ className, responsive = true }: LocationMenuProps) {
  const { origin } = useStore()
  const [open, setOpen] = useState(false)
  const label = originAreaLabel(origin.lat, origin.lng)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        className={cn(
          'inline-flex items-center gap-1.5 rounded-full bg-secondary/60 text-sm font-medium transition-colors hover:bg-secondary',
          responsive ? 'size-9 justify-center p-0 md:h-auto md:w-auto md:max-w-[11rem] md:px-3 md:py-2' : 'max-w-[11rem] px-3 py-2',
          className,
        )}
        aria-label={`Location: ${label}. Change location`}
      >
        <MapPin size={16} className="shrink-0 text-primary" />
        <span className={cn('truncate', responsive && 'hidden md:inline')}>{label}</span>
        <ChevronDown size={14} className={cn('shrink-0 text-muted-foreground', responsive && 'hidden md:inline')} />
      </PopoverTrigger>
      <PopoverContent side="bottom" align="end" className="p-0">
        <LocationMapPanel onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}