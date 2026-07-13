'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/** Hides chrome (e.g. site footer) on dashboard/admin so portals can be full-height. */
export function HideOnPortal({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/admin')) return null
  return <>{children}</>
}
