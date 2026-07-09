import Link from 'next/link'
import { MessageSquare, Plus, Star } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getBusinessesForOwner } from '@/lib/supabase/queries/businesses'
import { createClient } from '@/lib/supabase/server'

async function getOverviewData() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return { owned: [] as Awaited<ReturnType<typeof getBusinessesForOwner>>, unread: 0 }

  const owned = await getBusinessesForOwner(user.id)
  const businessIds = owned.map((row) => row.business?.id).filter((id): id is string => Boolean(id))

  let unread = 0
  if (businessIds.length > 0) {
    const { data } = await supabase.from('conversations').select('business_unread_count').in('business_id', businessIds)
    unread = (data ?? []).reduce((sum, row) => sum + row.business_unread_count, 0)
  }

  return { owned, unread }
}

export default async function DashboardOverviewPage() {
  const { owned, unread } = await getOverviewData()

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
          <p className="text-sm text-muted-foreground">Manage your listings and respond to customers.</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="size-4" />
            New listing
          </Button>
        </Link>
      </div>

      {unread > 0 && (
        <Card className="flex flex-row items-center gap-3 p-4">
          <MessageSquare className="size-5 text-primary" />
          <p className="text-sm">
            You have <strong>{unread}</strong> unread message{unread === 1 ? '' : 's'}.{' '}
            <Link href="/dashboard/messages" className="font-medium text-primary hover:underline">
              View inbox &rarr;
            </Link>
          </p>
        </Card>
      )}

      {owned.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 p-10 text-center">
          <p className="font-medium">You don&apos;t manage any businesses yet.</p>
          <p className="text-sm text-muted-foreground">Create your first listing to start reaching customers.</p>
          <Link href="/dashboard/listings/new">
            <Button>
              <Plus className="size-4" />
              Create a listing
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {owned.map(({ business }) =>
            business ? (
              <Link key={business.id} href={`/dashboard/listings/${business.id}`}>
                <Card className="h-full transition-shadow hover:shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      {business.name}
                      <Badge variant={business.status === 'published' ? 'default' : 'outline'}>
                        {business.status.replace('_', ' ')}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Star className="size-3.5 fill-current" />
                    {business.avg_rating > 0 ? business.avg_rating.toFixed(1) : 'No ratings yet'}
                    <span>&middot; {business.review_count} reviews</span>
                  </CardContent>
                </Card>
              </Link>
            ) : null,
          )}
        </div>
      )}
    </div>
  )
}
