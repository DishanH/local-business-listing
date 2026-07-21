'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Compass, Heart, Home, MessageSquare, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const links = [
  { href: '/', label: 'Home', icon: Home, exact: true },
  { href: '/search', label: 'Search', icon: Search },
  { href: '/favorites', label: 'Saved', icon: Heart },
  { href: '/messages', label: 'Inbox', icon: MessageSquare },
] as const

export function MobileNav() {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return null

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 md:hidden"
      aria-label="Main navigation"
    >
      <div className="mx-auto flex h-[3.75rem] max-w-lg items-stretch justify-around px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))]">
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href)
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-[4.25rem] flex-col items-center justify-center gap-0.5 rounded-xl px-2 py-1.5 text-[10px] font-medium transition-colors active:scale-95',
                active ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              <span
                className={cn(
                  'flex size-9 items-center justify-center rounded-xl transition-colors',
                  active && 'bg-primary/10',
                )}
              >
                <Icon size={20} strokeWidth={active ? 2.25 : 2} aria-hidden="true" />
              </span>
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
