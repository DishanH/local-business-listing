import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'

import { PortalShell } from '@/components/portal/portal-shell'
import type { PortalNavLink } from '@/components/portal/portal-nav'
import { createClient } from '@/lib/supabase/server'

const navLinks: PortalNavLink[] = [
  { href: '/dashboard', label: 'Overview', icon: 'layout-dashboard', exact: true },
  { href: '/dashboard/messages', label: 'Messages', icon: 'message-square' },
]

export default async function DashboardLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/dashboard')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'business_owner' && profile?.role !== 'admin') {
    redirect('/become-owner')
  }

  return (
    <PortalShell title="Business" subtitle="Localry" navLinks={navLinks}>
      {children}
    </PortalShell>
  )
}
