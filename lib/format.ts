import type { Business, DayKey } from './types'

export const dayOrder: DayKey[] = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
export const dayLabels: Record<DayKey, string> = {
  mon: 'Monday',
  tue: 'Tuesday',
  wed: 'Wednesday',
  thu: 'Thursday',
  fri: 'Friday',
  sat: 'Saturday',
  sun: 'Sunday',
}

/** Convert minutes-from-midnight to a display time like "9:00 AM". */
export function formatTime(minutes: number): string {
  const h24 = Math.floor(minutes / 60)
  const m = minutes % 60
  const period = h24 >= 12 ? 'PM' : 'AM'
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12
  return `${h12}:${m.toString().padStart(2, '0')} ${period}`
}

const jsDayToKey: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

export interface OpenStatus {
  open: boolean
  label: string
}

/** Determine whether a business is open right now. */
export function getOpenStatus(business: Business, now = new Date()): OpenStatus {
  const key = jsDayToKey[now.getDay()]
  const today = business.hours[key]
  const mins = now.getHours() * 60 + now.getMinutes()

  if (today.open !== null && today.close !== null && mins >= today.open && mins < today.close) {
    return { open: true, label: `Open until ${formatTime(today.close)}` }
  }

  // Find the next opening in the coming week.
  for (let i = 0; i < 7; i++) {
    const idx = (now.getDay() + i) % 7
    const dayKey = jsDayToKey[idx]
    const d = business.hours[dayKey]
    if (d.open === null) continue
    if (i === 0 && mins < d.open) {
      return { open: false, label: `Opens ${formatTime(d.open)}` }
    }
    if (i > 0) {
      const when = i === 1 ? 'tomorrow' : dayLabels[dayKey]
      return { open: false, label: `Opens ${when} at ${formatTime(d.open)}` }
    }
  }
  return { open: false, label: 'Closed' }
}

/** Haversine distance in miles between two coordinates. */
export function distanceMiles(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const toRad = (x: number) => (x * Math.PI) / 180
  const R = 3958.8
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2)
  return 2 * R * Math.asin(Math.sqrt(h))
}

export function formatDistance(miles: number): string {
  if (miles < 0.1) return 'nearby'
  if (miles < 10) return `${miles.toFixed(1)} mi`
  return `${Math.round(miles)} mi`
}

export function priceLabel(level: number): string {
  return '$'.repeat(level)
}
