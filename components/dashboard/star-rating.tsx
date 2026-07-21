import { Star } from 'lucide-react'

import { cn } from '@/lib/utils'

export function StarRating({
  value,
  count,
  size = 12,
  className,
  emptyLabel = 'No ratings',
}: {
  value: number
  count?: number
  size?: number
  className?: string
  emptyLabel?: string
}) {
  if (!count && value <= 0) {
    return <span className={cn('text-[11px] text-muted-foreground', className)}>{emptyLabel}</span>
  }

  return (
    <span className={cn('inline-flex items-center gap-1 text-[11px] text-muted-foreground', className)}>
      <Star size={size} className="fill-amber-500 text-amber-500" />
      <span className="font-medium text-foreground">{value > 0 ? value.toFixed(1) : '-'}</span>
      {typeof count === 'number' && <span>({count})</span>}
    </span>
  )
}
