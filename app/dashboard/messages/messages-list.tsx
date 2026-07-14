'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, MessageSquare } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/dashboard/star-rating'
import { cn } from '@/lib/utils'

const PAGE_SIZE = 12

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatWhen(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

type Conversation = {
  id: string
  customer_id: string
  business_id: string
  last_message_at: string | null
  business_unread_count: number
  customerName: string
  businessName: string
  customerAvgRating: number
  customerRatingCount: number
}

export function MessagesList({ conversations }: { conversations: Conversation[] }) {
  const pathname = usePathname()
  const totalPages = Math.max(1, Math.ceil(conversations.length / PAGE_SIZE))
  const [page, setPage] = useState(1)
  const safePage = Math.min(page, totalPages)

  const pageItems = useMemo(() => {
    const from = (safePage - 1) * PAGE_SIZE
    return conversations.slice(from, from + PAGE_SIZE)
  }, [conversations, safePage])

  if (conversations.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 p-8 text-center text-muted-foreground">
        <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
          <MessageSquare className="size-5" />
        </span>
        <p className="text-sm font-medium text-foreground">No conversations yet</p>
        <p className="text-xs">Messages from customers will show up here.</p>
      </div>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="flex flex-col">
          {pageItems.map((conversation) => {
            const isActive = pathname === `/dashboard/messages/${conversation.id}`
            return (
              <Link
                key={conversation.id}
                href={`/dashboard/messages/${conversation.id}`}
                className={cn(
                  'flex items-center gap-3 border-b px-4 py-3 transition-colors hover:bg-muted/50',
                  isActive && 'bg-muted',
                )}
              >
                <Avatar className="size-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {initials(conversation.customerName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-medium">{conversation.customerName}</p>
                    {conversation.business_unread_count > 0 && (
                      <Badge variant="default" className="h-5 shrink-0 px-1.5 text-xs">
                        {conversation.business_unread_count}
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-xs text-muted-foreground">{conversation.businessName}</p>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {formatWhen(conversation.last_message_at)}
                    </span>
                  </div>
                  {conversation.customerRatingCount > 0 && (
                    <StarRating
                      value={conversation.customerAvgRating}
                      count={conversation.customerRatingCount}
                      className="mt-0.5"
                    />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex shrink-0 items-center justify-between gap-2 border-t px-3 py-2">
          <p className="text-[11px] text-muted-foreground">
            {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(conversations.length, safePage * PAGE_SIZE)} of{' '}
            {conversations.length}
          </p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-3.5" />
              Prev
            </Button>
            <span className="px-1.5 text-[11px] tabular-nums text-muted-foreground">
              {safePage}/{totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="size-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
