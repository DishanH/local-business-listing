'use client'

import { Star } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface StarRatingProps {
  value: number
  size?: number
  className?: string
}

export function StarRating({ value, size = 16, className }: StarRatingProps) {
  return (
    <div className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${value.toFixed(1)} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => {
        const fill = Math.max(0, Math.min(1, value - (i - 1)))
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="absolute inset-0 text-muted-foreground/40" />
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
              <Star size={size} className="text-[color:var(--chart-3)]" fill="currentColor" />
            </span>
          </span>
        )
      })}
    </div>
  )
}

interface StarInputProps {
  value: number
  onChange: (v: number) => void
  size?: number
}

export function StarInput({ value, onChange, size = 28 }: StarInputProps) {
  const [hover, setHover] = useState(0)
  const shown = hover || value
  return (
    <div className="inline-flex items-center gap-1" role="radiogroup" aria-label="Your rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? 's' : ''}`}
          className="rounded-sm p-0.5 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-ring"
          onMouseEnter={() => setHover(i)}
          onMouseLeave={() => setHover(0)}
          onClick={() => onChange(i)}
        >
          <Star
            size={size}
            className={i <= shown ? 'text-[color:var(--chart-3)]' : 'text-muted-foreground/40'}
            fill={i <= shown ? 'currentColor' : 'none'}
          />
        </button>
      ))}
    </div>
  )
}
