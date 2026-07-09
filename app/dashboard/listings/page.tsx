import Link from 'next/link'
import { Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getBusinessesForOwner } from '@/lib/supabase/queries/businesses'
import { createClient } from '@/lib/supabase/server'

async function getOwned() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []
  return getBusinessesForOwner(user.id)
}

export default async function DashboardListingsPage() {
  const owned = await getOwned()

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">My listings</h2>
          <p className="text-sm text-muted-foreground">Every business you own or manage.</p>
        </div>
        <Link href="/dashboard/listings/new">
          <Button>
            <Plus className="size-4" />
            New listing
          </Button>
        </Link>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium text-right">Role</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {owned.map(({ business, role }) => (
              <tr key={business.id} className="cursor-pointer hover:bg-muted/40">
                <td className="px-4 py-3 font-medium">
                  <Link href={`/dashboard/listings/${business.id}`} className="hover:underline">
                    {business.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={business.status === 'published' ? 'default' : 'outline'}>
                    {business.status.replace('_', ' ')}
                  </Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {business.avg_rating > 0 ? `${business.avg_rating.toFixed(1)} (${business.review_count})` : '—'}
                </td>
                <td className="px-4 py-3 text-right text-muted-foreground capitalize">{role}</td>
              </tr>
            ))}
            {owned.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-10 text-center text-muted-foreground">
                  No listings yet.{' '}
                  <Link href="/dashboard/listings/new" className="font-medium text-primary hover:underline">
                    Create your first one &rarr;
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
