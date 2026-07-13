'use client'

import Image from 'next/image'
import { MapPin } from 'lucide-react'
import type { Business, Category } from '@/lib/types'
import { StarRating } from '@/components/star-rating'
import { FavoriteButton } from '@/components/favorite-button'
import { CategoryIcon } from '@/components/category-icon'
import { useStore } from '@/components/store-provider'
import { useOpenStatus } from '@/hooks/use-open-status'
import { priceLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

export function ProfileHeader({
  business,
  category,
}: {
  business: Business
  category?: Category
}) {
  const { getRating } = useStore()
  // Prefer DB-backed avg_rating / review_count on live listings.
  const rating = business.rating ?? getRating(business.id)
  const status = useOpenStatus(business)

  return (
    <section className="overflow-hidden rounded-3xl border border-border bg-card">
      <div className="relative h-56 w-full sm:h-72 md:h-80">
        <Image
          src={business.image || '/placeholder.svg'}
          alt={business.name}
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 1024px"
        />
        <div className="absolute right-4 top-4">
          <FavoriteButton businessId={business.id} dbId={business.dbId} />
        </div>
      </div>

      <div className="p-6 md:p-8">
        <div className="flex flex-wrap items-center gap-2">
          {category ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-sm font-medium text-secondary-foreground">
              <CategoryIcon name={category.icon} className="size-3.5" />
              {category.name}
            </span>
          ) : null}
          {status ? (
            <span
              className={cn(
                'inline-flex rounded-full px-3 py-1 text-sm font-medium',
                status.open ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
              )}
            >
              {status.label}
            </span>
          ) : null}
          <span className="text-sm font-medium text-muted-foreground">{priceLabel(business.priceLevel)}</span>
        </div>

        <h1 className="mt-3 text-pretty font-serif text-3xl font-bold text-card-foreground md:text-4xl">
          {business.name}
        </h1>
        <p className="mt-1 text-pretty text-lg text-muted-foreground">{business.tagline}</p>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
          <div className="flex items-center gap-2">
            <StarRating value={rating.avg} size={18} />
            <span className="font-semibold text-card-foreground">{rating.avg.toFixed(1)}</span>
            <span className="text-muted-foreground">({rating.count} reviews)</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4" aria-hidden="true" />
            {business.address}, {business.city}
          </div>
        </div>

        <p className="mt-5 max-w-2xl text-pretty leading-relaxed text-muted-foreground">
          {business.description}
        </p>
      </div>
    </section>
  )
}
