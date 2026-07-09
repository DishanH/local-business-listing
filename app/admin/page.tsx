import Link from 'next/link'
import { AlertCircle, CheckCircle2, Store, Users } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

async function getCounts() {
  const supabase = await createClient()

  const [pending, published, businesses, users] = await Promise.all([
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'pending_review'),
    supabase.from('businesses').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('businesses').select('id', { count: 'exact', head: true }),
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
  ])

  return {
    pending: pending.count ?? 0,
    published: published.count ?? 0,
    businesses: businesses.count ?? 0,
    users: users.count ?? 0,
  }
}

export default async function AdminDashboardPage() {
  const counts = await getCounts()

  const stats = [
    { label: 'Pending review', value: counts.pending, icon: AlertCircle, href: '/admin/businesses?status=pending_review', accent: 'text-amber-600 dark:text-amber-400' },
    { label: 'Published listings', value: counts.published, icon: CheckCircle2, href: '/admin/businesses?status=published', accent: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Total businesses', value: counts.businesses, icon: Store, href: '/admin/businesses', accent: 'text-foreground' },
    { label: 'Registered users', value: counts.users, icon: Users, href: '/admin/users', accent: 'text-foreground' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Overview</h2>
        <p className="text-sm text-muted-foreground">Moderate listings and manage user accounts across the platform.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href}>
            <Card className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="flex items-center justify-between text-sm font-normal text-muted-foreground">
                  {stat.label}
                  <stat.icon className={`size-4 ${stat.accent}`} />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-semibold">{stat.value}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {counts.pending > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Action needed</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            {counts.pending} listing{counts.pending === 1 ? '' : 's'} waiting on approval.{' '}
            <Link href="/admin/businesses?status=pending_review" className="font-medium text-primary hover:underline">
              Review now &rarr;
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
