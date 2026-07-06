'use client'

import { Heart } from 'lucide-react'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  businessId: string
  className?: string
  size?: number
  /** solid pill style vs. plain icon */
  variant?: 'pill' | 'plain'
}

export function FavoriteButton({ businessId, className, size = 18, variant = 'pill' }: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite } = useStore()
  const active = isFavorite(businessId)

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        toggleFavorite(businessId)
      }}
      className={cn(
        'inline-flex items-center justify-center rounded-full transition-colors',
        variant === 'pill' &&
          'size-9 bg-background/85 text-foreground backdrop-blur-sm shadow-sm hover:bg-background',
        variant === 'plain' && 'text-muted-foreground hover:text-foreground',
        className,
      )}
    >
      <Heart
        size={size}
        className={cn('transition-colors', active && 'text-[color:var(--destructive)]')}
        fill={active ? 'currentColor' : 'none'}
      />
    </button>
  )
}
