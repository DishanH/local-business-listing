'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  FolderTree,
  LayoutDashboard,
  MessageSquare,
  Store,
  Users,
  type LucideIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

/** Serializable icon keys — resolved to Lucide components on the client. */
export type PortalNavIcon = 'layout-dashboard' | 'store' | 'message-square' | 'folder-tree' | 'users'

const icons: Record<PortalNavIcon, LucideIcon> = {
  'layout-dashboard': LayoutDashboard,
  store: Store,
  'message-square': MessageSquare,
  'folder-tree': FolderTree,
  users: Users,
}

export interface PortalNavLink {
  href: string
  label: string
  icon: PortalNavIcon
  exact?: boolean
}

export function PortalNav({ links }: { links: PortalNavLink[] }) {
  const pathname = usePathname()

  return (
    <nav className="flex flex-col gap-0.5">
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)
        const Icon = icons[link.icon]
        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {link.label}
          </Link>
        )
      })}
    </nav>
  )
}
