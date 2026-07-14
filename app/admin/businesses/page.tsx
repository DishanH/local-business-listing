import Link from 'next/link'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pagination, parsePageParam } from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/server'
import type { BusinessStatus } from '@/lib/supabase/database.types'

export const dynamic = 'force-dynamic'

import { updateBusinessStatus } from './actions'

const PAGE_SIZE = 15

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

async function getBusinesses(status: string | undefined, pageParam: string | undefined) {
  const supabase = await createClient()
  let countQuery = supabase.from('businesses').select('id', { count: 'exact', head: true })
  if (status && status !== 'all') {
    countQuery = countQuery.eq('status', status as BusinessStatus)
  }
  const { count, error: countError } = await countQuery
  if (countError) throw countError

  const total = count ?? 0
  const { page, totalPages, from, to } = parsePageParam(pageParam, total, PAGE_SIZE)

  let query = supabase
    .from('businesses')
    .select('id, name, slug, status, category_id, avg_rating, review_count, created_at')
    .order('created_at', { ascending: false })
    .range(from, to)

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

  return {
    businesses: (data ?? []).map((biz) => ({
      ...biz,
      categoryName: categoryNameById.get(biz.category_id) ?? '—',
    })),
    page,
    totalPages,
    total,
  }
}

export default async function AdminBusinessesPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; page?: string }>
}) {
  const { status, page: pageParam } = await searchParams
  const activeStatus = status ?? 'all'
  const { businesses, page, totalPages, total } = await getBusinesses(activeStatus, pageParam)

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Businesses</h2>
        <p className="text-xs text-muted-foreground">Approve, publish, or suspend listings.</p>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={tab.value === 'all' ? '/admin/businesses' : `/admin/businesses?status=${tab.value}`}
          >
            <Button variant={activeStatus === tab.value ? 'default' : 'outline'} size="sm">
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      <Card className="overflow-hidden rounded-xl p-0 shadow-none">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Category</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Rating</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {businesses.map((biz) => (
              <tr key={biz.id}>
                <td className="px-4 py-2.5 font-medium">
                  <Link href={`/business/${biz.slug}`} className="hover:underline" target="_blank">
                    {biz.name}
                  </Link>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">{biz.categoryName}</td>
                <td className="px-4 py-2.5">
                  <Badge variant={STATUS_BADGE_VARIANT[biz.status]}>{biz.status.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  {biz.avg_rating > 0 ? `${biz.avg_rating.toFixed(1)} (${biz.review_count})` : '—'}
                </td>
                <td className="px-4 py-2.5">
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
        <Pagination
          basePath="/admin/businesses"
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
          params={{ status: activeStatus === 'all' ? undefined : activeStatus }}
        />
      </Card>
    </div>
  )
}
