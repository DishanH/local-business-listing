'use client'

import Image from 'next/image'
import Link from 'next/link'
import { MapPin } from 'lucide-react'
import { StarRating } from '@/components/star-rating'
import { FavoriteButton } from '@/components/favorite-button'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'
import { useOpenStatus } from '@/hooks/use-open-status'
import { distanceMiles, formatDistance, priceLabel } from '@/lib/format'
import type { Business } from '@/lib/types'
import { cn } from '@/lib/utils'

export function BusinessCard({ business }: { business: Business }) {
  const { getRating, origin, categories, cities } = useStore()
  const rating = business.rating ?? getRating(business.id)
  const category = categories.find((c) => c.id === business.categoryId)
  const cityName = cities.find((c) => c.id === business.city)?.name ?? ''
  const dist = formatDistance(distanceMiles(origin, business))
  const status = useOpenStatus(business)

  return (
    <Link
      href={`/business/${business.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border bg-card transition-all hover:-translate-y-1 hover:shadow-lg"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={business.image || '/placeholder.svg'}
          alt={business.name}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute right-3 top-3">
          <FavoriteButton businessId={business.id} />
        </div>
        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-background/85 px-2.5 py-1 text-xs font-medium backdrop-blur-sm">
          <CategoryIcon name={category?.icon ?? ''} size={13} className="text-primary" />
          {category?.name}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-balance">{business.name}</h3>
          <span className="shrink-0 text-sm text-muted-foreground">{priceLabel(business.priceLevel)}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <StarRating value={rating.avg} />
          <span className="font-medium">{rating.avg ? rating.avg.toFixed(1) : 'New'}</span>
          {rating.count > 0 && <span className="text-muted-foreground">({rating.count})</span>}
        </div>

        <p className="line-clamp-2 text-sm text-muted-foreground">{business.tagline}</p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-2 text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <MapPin size={13} />
            {cityName} · {dist}
          </span>
          {status ? (
            <span className={cn('font-medium', status.open ? 'text-primary' : 'text-muted-foreground')}>
              {status.open ? 'Open now' : 'Closed'}
            </span>
          ) : null}
        </div>
      </div>
    </Link>
  )
}
