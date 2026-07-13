'use client'

import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export function MessagesSplit({
  list,
  children,
}: {
  list: ReactNode
  children: ReactNode
}) {
  const pathname = usePathname()
  const inThread = pathname !== '/dashboard/messages'

  return (
    <div className="flex h-full min-h-0">
      <div
        className={cn(
          'flex min-h-0 w-full shrink-0 flex-col border-r md:w-[320px] lg:w-[360px]',
          inThread && 'hidden md:flex',
        )}
      >
        {list}
      </div>
      <div className={cn('flex min-h-0 min-w-0 flex-1 flex-col', !inThread && 'hidden md:flex')}>{children}</div>
    </div>
  )
}
