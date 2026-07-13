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
import { buttonVariants } from '@/components/ui/button'

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

export function PortalNav({
  links,
  collapsed = false,
  orientation = 'vertical',
}: {
  links: PortalNavLink[]
  collapsed?: boolean
  orientation?: 'vertical' | 'horizontal'
}) {
  const pathname = usePathname()

  return (
    <nav
      className={cn(
        orientation === 'horizontal' ? 'flex flex-row items-center gap-1' : 'flex flex-col gap-1',
      )}
    >
      {links.map((link) => {
        const isActive = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`)
        const Icon = icons[link.icon]
        return (
          <Link
            key={link.href}
            href={link.href}
            title={collapsed ? link.label : undefined}
            className={cn(
              buttonVariants({
                variant: isActive ? 'default' : 'ghost',
                size: collapsed ? 'icon' : 'sm',
              }),
              collapsed ? 'size-8' : 'h-8 justify-start gap-2 px-2.5 text-xs',
              !isActive && 'text-muted-foreground',
              orientation === 'horizontal' && 'shrink-0',
            )}
          >
            <Icon className="size-4 shrink-0" />
            {!collapsed && <span className="truncate">{link.label}</span>}
          </Link>
        )
      })}
    </nav>
  )
}
