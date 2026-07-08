'use client'

import { Globe, Mail, MapPin, Navigation, Phone } from 'lucide-react'
import type { Business } from '@/lib/types'
import { useStore } from '@/components/store-provider'
import { distanceMiles, formatDistance } from '@/lib/format'

export function ContactPanel({ business }: { business: Business }) {
  const { origin, originLabel } = useStore()
  const miles = distanceMiles(origin, business)

  const rows = [
    {
      icon: MapPin,
      label: business.address,
      sub: `${business.city} · ${formatDistance(miles)} from ${originLabel}`,
    },
    { icon: Phone, label: business.phone, href: `tel:${business.phone}` },
    { icon: Mail, label: business.email, href: `mailto:${business.email}` },
    { icon: Globe, label: business.website, href: `https://${business.website}` },
  ]

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <Navigation className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Contact & location</h2>
      </div>

      <ul className="flex flex-col gap-3">
        {rows.map((row, i) => {
          const Icon = row.icon
          const content = (
            <div className="flex items-start gap-3">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <div className="min-w-0">
                <p className="truncate text-sm text-card-foreground">{row.label}</p>
                {'sub' in row && row.sub ? (
                  <p className="text-xs text-muted-foreground">{row.sub}</p>
                ) : null}
              </div>
            </div>
          )
          return (
            <li key={i}>
              {'href' in row && row.href ? (
                <a
                  href={row.href}
                  className="block rounded-lg transition-colors hover:text-primary"
                  target={row.href.startsWith('http') ? '_blank' : undefined}
                  rel={row.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {content}
                </a>
              ) : (
                content
              )}
            </li>
          )
        })}
      </ul>
    </section>
  )
}
