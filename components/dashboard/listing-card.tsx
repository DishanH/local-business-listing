import Image from 'next/image'
import Link from 'next/link'
import { Eye, Pencil, Star, Store } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { Database } from '@/lib/supabase/database.types'

type Business = Database['public']['Tables']['businesses']['Row']

const statusVariant: Record<Business['status'], 'default' | 'outline' | 'secondary'> = {
  published: 'default',
  pending_review: 'secondary',
  draft: 'outline',
  suspended: 'outline',
  archived: 'outline',
}

function summary(business: Business) {
  const text = (business.tagline || business.description || '').trim()
  return text || 'No description yet - add one in business details.'
}

export function ListingCard({ business, role }: { business: Business; role?: string }) {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-xl border bg-card transition-colors hover:bg-accent/20">
      <Link href={`/dashboard/listings/${business.id}`} className="block shrink-0">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-muted">
          {business.cover_image_url ? (
            <Image
              src={business.cover_image_url}
              alt={business.name}
              fill
              sizes="(max-width: 640px) 100vw, 33vw"
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground">
              <Store size={22} />
            </div>
          )}
          <Badge
            variant={statusVariant[business.status] ?? 'outline'}
            className="absolute left-2 top-2 capitalize shadow-sm"
          >
            {business.status.replace('_', ' ')}
          </Badge>
        </div>
      </Link>

      <div className="flex min-h-0 flex-1 flex-col gap-2 p-3">
        <div className="min-h-0 flex-1">
          <Link
            href={`/dashboard/listings/${business.id}`}
            className="line-clamp-1 text-sm font-semibold hover:underline"
          >
            {business.name}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary(business)}</p>
        </div>

        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Star size={12} className="fill-current text-amber-500" />
            {business.avg_rating > 0 ? business.avg_rating.toFixed(1) : '-'}
            {business.review_count > 0 && <span>({business.review_count})</span>}
          </span>
          {role && <span className="capitalize">{role}</span>}
        </div>

        <div className="flex gap-1.5 pt-0.5">
          <Link href={`/dashboard/listings/${business.id}`} className="flex-1">
            <Button variant="secondary" size="sm" className="h-7 w-full text-xs">
              <Pencil className="size-3" />
              Edit
            </Button>
          </Link>
          <Link href={`/business/${business.slug}`} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button variant="outline" size="sm" className="h-7 w-full text-xs">
              <Eye className="size-3" />
              Preview
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

/** Compact row for overview - title + description focused, equal height. */
export function ListingRow({ business, role }: { business: Business; role?: string }) {
  return (
    <div className="group flex items-stretch gap-3 border-b px-3 py-3 transition-colors last:border-b-0 hover:bg-muted/40 sm:px-4">
      <Link
        href={`/dashboard/listings/${business.id}`}
        className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted sm:size-16"
      >
        {business.cover_image_url ? (
          <Image
            src={business.cover_image_url}
            alt=""
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <span className="flex h-full items-center justify-center text-muted-foreground">
            <Store size={18} />
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/dashboard/listings/${business.id}`}
            className="truncate text-sm font-semibold hover:underline"
          >
            {business.name}
          </Link>
          <Badge variant={statusVariant[business.status] ?? 'outline'} className="h-5 capitalize">
            {business.status.replace('_', ' ')}
          </Badge>
          {role && <span className="text-[11px] text-muted-foreground capitalize">{role}</span>}
        </div>
        <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">{summary(business)}</p>
        <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
          <Star size={11} className="fill-current text-amber-500" />
          {business.avg_rating > 0 ? business.avg_rating.toFixed(1) : 'No ratings'}
          {business.review_count > 0 && <span>· {business.review_count} reviews</span>}
        </div>
      </div>

      <div className="flex shrink-0 flex-col justify-center gap-1.5 sm:flex-row sm:items-center">
        <Link href={`/dashboard/listings/${business.id}`}>
          <Button variant="secondary" size="sm" className="h-7 text-xs">
            <Pencil className="size-3" />
            Edit
          </Button>
        </Link>
        <Link href={`/business/${business.slug}`} target="_blank" rel="noopener noreferrer">
          <Button variant="outline" size="sm" className="h-7 text-xs">
            <Eye className="size-3" />
            Preview
          </Button>
        </Link>
      </div>
    </div>
  )
}
