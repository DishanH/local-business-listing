'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'
import { ArrowLeft, Compass } from 'lucide-react'

import { PortalNav, type PortalNavLink } from '@/components/portal/portal-nav'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

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
  const pathname = usePathname()
  const flush =
    pathname.startsWith('/dashboard/messages') ||
    pathname.startsWith('/dashboard/listings/') ||
    pathname === '/dashboard/listings/new' ||
    pathname.startsWith('/admin')

  return (
    <div className="bg-muted/30 px-3 py-3 sm:px-4 sm:py-4 md:px-6">
      <div className="mx-auto flex h-[calc(100dvh-3.5rem-1.5rem)] w-full max-w-7xl overflow-hidden rounded-xl border bg-background shadow-sm sm:h-[calc(100dvh-4rem-2rem)]">
        <aside className="hidden w-[200px] shrink-0 flex-col border-r bg-muted/20 lg:flex xl:w-[220px]">
          <div className="flex h-12 items-center gap-2 px-3">
            <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Compass size={14} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold leading-none">{title}</p>
              <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{subtitle}</p>
            </div>
          </div>
          <Separator />
          <div className="flex flex-1 flex-col overflow-y-auto p-2">
            <PortalNav links={navLinks} />
          </div>
          <Separator />
          <div className="p-2">
            <Link
              href="/"
              className="inline-flex h-8 w-full items-center gap-2 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ArrowLeft size={13} />
              Back to site
            </Link>
          </div>
        </aside>

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex h-11 shrink-0 items-center gap-2 overflow-x-auto border-b px-2 lg:hidden">
            <span className="shrink-0 text-[11px] font-semibold tracking-wide text-muted-foreground uppercase">
              {title}
            </span>
            <Separator orientation="vertical" className="h-3.5" />
            <div className="flex min-w-0 flex-1 gap-1 overflow-x-auto">
              <PortalNav links={navLinks} orientation="horizontal" />
            </div>
          </div>

          <div className={cn('min-h-0 flex-1', flush ? 'overflow-hidden' : 'overflow-y-auto p-3 sm:p-4')}>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
