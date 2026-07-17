'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'
import type { Business, DayKey } from '@/lib/types'
import { dayLabels, dayOrder, formatTime } from '@/lib/format'
import { useOpenStatus } from '@/hooks/use-open-status'
import { SectionEditLink } from '@/components/profile/section-edit-link'
import { cn } from '@/lib/utils'

const jsDayToKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export function HoursPanel({
  business,
  isOwner,
  manageHref,
}: {
  business: Business
  isOwner?: boolean
  manageHref?: string
}) {
  const status = useOpenStatus(business)
  // Compute the current day on the client to avoid SSR/timezone hydration mismatches.
  const [todayKey, setTodayKey] = useState<DayKey | null>(null)

  useEffect(() => {
    setTodayKey(jsDayToKey[new Date().getDay()])
  }, [])

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Working hours</h2>
        {isOwner && manageHref ? <SectionEditLink href={manageHref} /> : null}
      </div>

      <p
        className={cn(
          'mb-4 inline-flex rounded-full px-3 py-1 text-sm font-medium',
          status
            ? status.open
              ? 'bg-primary/10 text-primary'
              : 'bg-muted text-muted-foreground'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {status ? status.label : 'Checking hours…'}
      </p>

      <ul className="divide-y divide-border">
        {dayOrder.map((day) => {
          const h = business.hours[day]
          const isToday = day === todayKey
          return (
            <li
              key={day}
              className={cn(
                'flex items-center justify-between py-2 text-sm',
                isToday ? 'font-semibold text-card-foreground' : 'text-muted-foreground',
              )}
            >
              <span>
                {dayLabels[day]}
                {isToday ? ' (Today)' : ''}
              </span>
              <span>
                {h.open === null || h.close === null
                  ? 'Closed'
                  : `${formatTime(h.open)} – ${formatTime(h.close)}`}
              </span>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
