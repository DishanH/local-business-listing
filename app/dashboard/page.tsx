import Link from 'next/link'
import { MessageSquare, Plus, Store, CheckCircle2, FileClock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ListingRow } from '@/components/dashboard/listing-card'
import { Pagination, parsePageParam } from '@/components/ui/pagination'
import { getBusinessesForOwner } from '@/lib/supabase/queries/businesses'
import { createClient } from '@/lib/supabase/server'

const PAGE_SIZE = 8

async function getOverviewData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { owned: [] as Awaited<ReturnType<typeof getBusinessesForOwner>>, unread: 0 }

  const owned = await getBusinessesForOwner(user.id)
  const businessIds = owned.map((row) => row.business?.id).filter((id): id is string => Boolean(id))

  let unread = 0
  // Chunk `.in()` filters — a long ID list overflows HTTP header limits.
  const CHUNK = 80
  for (let i = 0; i < businessIds.length; i += CHUNK) {
    const chunk = businessIds.slice(i, i + CHUNK)
    const { data } = await supabase.from('conversations').select('business_unread_count').in('business_id', chunk)
    unread += (data ?? []).reduce((sum, row) => sum + row.business_unread_count, 0)
  }

  return { owned, unread }
}

export default async function DashboardOverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const { owned, unread } = await getOverviewData()
  const published = owned.filter(({ business }) => business?.status === 'published').length
  const drafts = owned.filter(
    ({ business }) => business?.status === 'draft' || business?.status === 'pending_review',
  ).length

  const { page, totalPages, from, to } = parsePageParam(pageParam, owned.length, PAGE_SIZE)
  const pageItems = owned.slice(from, to + 1)

  const stats = [
    { label: 'Listings', value: owned.length, icon: Store },
    { label: 'Published', value: published, icon: CheckCircle2 },
    { label: 'In progress', value: drafts, icon: FileClock },
    { label: 'Unread', value: unread, icon: MessageSquare },
  ]

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Overview</h2>
          <p className="text-xs text-muted-foreground">Manage listings and respond to customers.</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button size="sm">
            <Plus className="size-3.5" />
            New listing
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="flex flex-row items-center gap-3 rounded-xl p-3 shadow-none">
            <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-accent text-primary">
              <stat.icon className="size-3.5" />
            </span>
            <div className="min-w-0">
              <p className="text-lg font-semibold leading-none tracking-tight">{stat.value}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">{stat.label}</p>
            </div>
          </Card>
        ))}
      </div>

      {unread > 0 && (
        <Card className="flex flex-row items-center gap-2.5 rounded-xl p-3 shadow-none">
          <MessageSquare className="size-4 shrink-0 text-primary" />
          <p className="text-sm">
            <strong>{unread}</strong> unread message{unread === 1 ? '' : 's'}.{' '}
            <Link href="/dashboard/messages" className="font-medium text-primary hover:underline">
              Open inbox
            </Link>
          </p>
        </Card>
      )}

      <Card className="overflow-hidden rounded-xl p-0 shadow-none">
        <div className="border-b px-3 py-2.5 sm:px-4">
          <h3 className="text-sm font-semibold">Your listings</h3>
          <p className="text-[11px] text-muted-foreground">Title and description for each business</p>
        </div>

        {owned.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-10 text-center">
            <p className="text-sm font-medium">No businesses yet</p>
            <p className="text-xs text-muted-foreground">Create a listing to start reaching customers.</p>
            <Link href="/dashboard/listings/new" className="mt-1">
              <Button size="sm">
                <Plus className="size-3.5" />
                Create a listing
              </Button>
            </Link>
          </div>
        ) : (
          <>
            <div>
              {pageItems.map(({ business, role }) =>
                business ? <ListingRow key={business.id} business={business} role={role} /> : null,
              )}
            </div>
            <Pagination
              basePath="/dashboard"
              page={page}
              totalPages={totalPages}
              total={owned.length}
              pageSize={PAGE_SIZE}
            />
          </>
        )}
      </Card>
    </div>
  )
}
