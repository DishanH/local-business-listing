'use client'

import { Clock } from 'lucide-react'
import type { Business } from '@/lib/types'
import { dayLabels, dayOrder, formatTime, getOpenStatus } from '@/lib/format'
import { cn } from '@/lib/utils'

const jsDayToKey = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const

export function HoursPanel({ business }: { business: Business }) {
  const status = getOpenStatus(business)
  const todayKey = jsDayToKey[new Date().getDay()]

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Clock className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Working hours</h2>
      </div>

      <p
        className={cn(
          'mb-4 inline-flex rounded-full px-3 py-1 text-sm font-medium',
          status.open ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground',
        )}
      >
        {status.label}
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
