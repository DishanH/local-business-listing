import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { PortalShell } from '@/components/portal/portal-shell'
import type { PortalNavLink } from '@/components/portal/portal-nav'
import { createClient } from '@/lib/supabase/server'

const navLinks: PortalNavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: 'layout-dashboard', exact: true },
  { href: '/admin/businesses', label: 'Businesses', icon: 'store' },
  { href: '/admin/categories', label: 'Categories', icon: 'folder-tree' },
  { href: '/admin/users', label: 'Users', icon: 'users' },
]

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/admin')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role !== 'admin') redirect('/')

  return (
    <PortalShell title="Admin" subtitle="Localry" navLinks={navLinks}>
      {children}
    </PortalShell>
  )
}
