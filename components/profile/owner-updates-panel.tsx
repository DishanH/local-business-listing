import Link from 'next/link'
import { CalendarDays, Megaphone, TicketPercent } from 'lucide-react'
import type { OwnerPost, OwnerPostType } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionEditLink } from '@/components/profile/section-edit-link'
import { cn } from '@/lib/utils'

const typeMeta: Record<
  OwnerPostType,
  { label: string; icon: typeof Megaphone; dot: string }
> = {
  offer: { label: 'Offer', icon: TicketPercent, dot: 'bg-primary' },
  event: { label: 'Event', icon: CalendarDays, dot: 'bg-accent-foreground' },
  update: { label: 'Update', icon: Megaphone, dot: 'bg-muted-foreground' },
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function OwnerUpdatesPanel({
  posts,
  businessName,
  isOwner,
  manageHref,
}: {
  posts: OwnerPost[]
  businessName: string
  isOwner?: boolean
  manageHref?: string
}) {
  if (!posts.length) {
    if (!isOwner) return null
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="mb-1 flex items-center gap-2">
          <Megaphone className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">News &amp; offers</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Only you can see this. Post an offer, event, or update and it&apos;ll show here for customers.
        </p>
        {manageHref ? (
          <Link href={manageHref}>
            <Button variant="outline" size="sm">
              Add a post
            </Button>
          </Link>
        ) : null}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Megaphone className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">News &amp; offers</h2>
        {isOwner && manageHref ? <SectionEditLink href={manageHref} /> : null}
      </div>
      <p className="mb-5 text-sm text-muted-foreground">Promotions and announcements from {businessName}.</p>

      <ol className="relative flex flex-col gap-6 border-l border-border pl-6">
        {posts.map((post) => {
          const meta = typeMeta[post.type]
          const Icon = meta.icon
          return (
            <li key={post.id} className="relative">
              <span
                className={cn(
                  'absolute -left-[27px] top-1 flex size-3 items-center justify-center rounded-full ring-4 ring-card',
                  meta.dot,
                )}
                aria-hidden="true"
              />
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                  <Icon className="size-3.5" aria-hidden="true" />
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">· {formatDate(post.date)}</span>
                {post.badge ? (
                  <Badge className="ml-auto bg-primary/10 text-primary hover:bg-primary/10">{post.badge}</Badge>
                ) : null}
              </div>
              <h3 className="mt-1 break-words font-medium text-card-foreground">{post.title}</h3>
              <p className="mt-0.5 break-words text-sm leading-relaxed text-muted-foreground">{post.body}</p>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
