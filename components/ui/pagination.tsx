import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export const DEFAULT_PAGE_SIZE = 10

export function parsePageParam(raw: string | undefined | null, total: number, pageSize = DEFAULT_PAGE_SIZE) {
  const totalPages = Math.max(1, Math.ceil(Math.max(total, 0) / pageSize))
  const parsed = Number(raw)
  const page = Number.isFinite(parsed) && parsed >= 1 ? Math.min(totalPages, Math.floor(parsed)) : 1
  const from = (page - 1) * pageSize
  return { page, totalPages, pageSize, from, to: from + pageSize - 1 }
}

function hrefFor(basePath: string, page: number, params?: Record<string, string | undefined>) {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value && key !== 'page') search.set(key, value)
  }
  if (page > 1) search.set('page', String(page))
  const qs = search.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

export function Pagination({
  basePath,
  page,
  totalPages,
  total,
  pageSize = DEFAULT_PAGE_SIZE,
  params,
  className,
}: {
  basePath: string
  page: number
  totalPages: number
  total: number
  pageSize?: number
  params?: Record<string, string | undefined>
  className?: string
}) {
  if (totalPages <= 1) return null

  const start = Math.min(total, (page - 1) * pageSize + 1)
  const end = Math.min(total, page * pageSize)

  return (
    <div className={cn('flex flex-wrap items-center justify-between gap-2 border-t px-3 py-2.5 sm:px-4', className)}>
      <p className="text-xs text-muted-foreground">
        Showing {start}–{end} of {total}
      </p>
      <div className="flex items-center gap-1">
        <Link
          href={hrefFor(basePath, page - 1, params)}
          aria-disabled={page <= 1}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-7 gap-1 text-xs',
            page <= 1 && 'pointer-events-none opacity-40',
          )}
        >
          <ChevronLeft className="size-3.5" />
          Prev
        </Link>
        <span className="px-2 text-xs tabular-nums text-muted-foreground">
          {page} / {totalPages}
        </span>
        <Link
          href={hrefFor(basePath, page + 1, params)}
          aria-disabled={page >= totalPages}
          className={cn(
            buttonVariants({ variant: 'outline', size: 'sm' }),
            'h-7 gap-1 text-xs',
            page >= totalPages && 'pointer-events-none opacity-40',
          )}
        >
          Next
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  )
}
