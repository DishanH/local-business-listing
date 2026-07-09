import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { BusinessStatus } from '@/lib/supabase/database.types'

import { updateBusinessStatus } from './actions'

const STATUS_TABS: { value: BusinessStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'pending_review', label: 'Pending review' },
  { value: 'published', label: 'Published' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
]

const STATUS_BADGE_VARIANT: Record<BusinessStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  draft: 'outline',
  pending_review: 'secondary',
  published: 'default',
  suspended: 'destructive',
  archived: 'outline',
}

async function getBusinesses(status?: string) {
  const supabase = await createClient()
  let query = supabase
    .from('businesses')
    .select('id, name, slug, status, category_id, avg_rating, review_count, created_at')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status as BusinessStatus)
  }

  const { data, error } = await query
  if (error) throw error

  const categoryIds = [...new Set((data ?? []).map((biz) => biz.category_id))]
  const { data: categories } = categoryIds.length
    ? await supabase.from('categories').select('id, name').in('id', categoryIds)
    : { data: [] }
  const categoryNameById = new Map((categories ?? []).map((c) => [c.id, c.name]))

  return (data ?? []).map((biz) => ({ ...biz, categoryName: categoryNameById.get(biz.category_id) ?? '—' }))
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const { status } = await searchParams
  const activeStatus = status ?? 'all'
  const businesses = await getBusinesses(activeStatus)

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Businesses</h2>
        <p className="text-sm text-muted-foreground">Approve, publish, or suspend listings.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <Link key={tab.value} href={tab.value === 'all' ? '/admin/businesses' : `/admin/businesses?status=${tab.value}`}>
            <Button variant={activeStatus === tab.value ? 'default' : 'outline'} size="sm">
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Rating</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {businesses.map((biz) => (
              <tr key={biz.id}>
                <td className="px-4 py-3 font-medium">
                  <Link href={`/business/${biz.slug}`} className="hover:underline" target="_blank">
                    {biz.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{biz.categoryName}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_BADGE_VARIANT[biz.status]}>{biz.status.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  {biz.avg_rating > 0 ? `${biz.avg_rating.toFixed(1)} (${biz.review_count})` : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-1.5">
                    {biz.status !== 'published' && (
                      <form action={updateBusinessStatus.bind(null, biz.id, 'published')}>
                        <Button type="submit" size="sm" variant="outline">
                          Publish
                        </Button>
                      </form>
                    )}
                    {biz.status !== 'suspended' && (
                      <form action={updateBusinessStatus.bind(null, biz.id, 'suspended')}>
                        <Button type="submit" size="sm" variant="destructive">
                          Suspend
                        </Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {businesses.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No businesses in this view yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
