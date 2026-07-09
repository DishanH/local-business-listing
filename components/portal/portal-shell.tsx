import Link from 'next/link'
import type { ReactNode } from 'react'

import { PortalNav, type PortalNavLink } from '@/components/portal/portal-nav'

export function PortalShell({
  title,
  subtitle,
  navLinks,
  children,
}: {
  title: string
  subtitle: string
  navLinks: PortalNavLink[]
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-7xl gap-8 px-4 py-8 md:px-6">
      <aside className="hidden w-56 shrink-0 flex-col gap-6 md:flex">
        <div>
          <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{subtitle}</p>
          <h1 className="text-lg font-semibold">{title}</h1>
        </div>
        <PortalNav links={navLinks} />
        <Link href="/" className="mt-auto text-sm text-muted-foreground hover:text-foreground">
          &larr; Back to site
        </Link>
      </aside>

      <div className="min-w-0 flex-1">
        <div className="mb-6 flex items-center justify-between gap-4 md:hidden">
          <div>
            <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{subtitle}</p>
            <h1 className="text-lg font-semibold">{title}</h1>
          </div>
        </div>
        <div className="mb-6 md:hidden">
          <PortalNav links={navLinks} />
        </div>
        {children}
      </div>
    </div>
  )
}
