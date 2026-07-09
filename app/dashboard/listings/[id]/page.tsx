import { notFound } from 'next/navigation'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

import { archiveListing, submitForReview, updateHours, updateListing } from '../actions'

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function minutesToTime(minutes: number | null): string {
  if (minutes === null) return ''
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

async function getListing(id: string) {
  const supabase = await createClient()
  const { data: business } = await supabase.from('businesses').select('*').eq('id', id).single()
  if (!business) return null

  const { data: hours } = await supabase.from('business_hours').select('*').eq('business_id', id).order('day_of_week')

  const hoursByDay = new Map<number, Database['public']['Tables']['business_hours']['Row']>()
  for (const row of hours ?? []) hoursByDay.set(row.day_of_week, row)

  return { business, hoursByDay }
}

export default async function EditListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const listing = await getListing(id)
  if (!listing) notFound()

  const { business, hoursByDay } = listing

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
            {business.name}
            <Badge variant={business.status === 'published' ? 'default' : 'outline'}>
              {business.status.replace('_', ' ')}
            </Badge>
          </h2>
          <p className="text-sm text-muted-foreground">Keep your listing accurate so customers can find and trust you.</p>
        </div>
        <div className="flex gap-2">
          {business.status === 'draft' && (
            <form action={submitForReview.bind(null, business.id)}>
              <Button type="submit">Submit for review</Button>
            </form>
          )}
          {business.status !== 'archived' && (
            <form action={archiveListing.bind(null, business.id)}>
              <Button type="submit" variant="destructive">
                Archive
              </Button>
            </form>
          )}
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateListing.bind(null, business.id)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" name="name" defaultValue={business.name} required />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="tagline">Tagline</Label>
              <Input id="tagline" name="tagline" defaultValue={business.tagline ?? ''} placeholder="A short one-liner" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea id="description" name="description" defaultValue={business.description ?? ''} rows={4} />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" name="phone" defaultValue={business.phone ?? ''} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" defaultValue={business.email ?? ''} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={business.website ?? ''} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="price_level">Price level</Label>
                <select
                  id="price_level"
                  name="price_level"
                  defaultValue={business.price_level ?? ''}
                  className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  <option value="">Not set</option>
                  <option value="1">$</option>
                  <option value="2">$$</option>
                  <option value="3">$$$</option>
                  <option value="4">$$$$</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="address_line1">Address</Label>
              <Input id="address_line1" name="address_line1" defaultValue={business.address_line1 ?? ''} />
            </div>
            <Button type="submit" className="mt-1 w-fit">
              Save changes
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Hours</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={updateHours.bind(null, business.id)} className="flex flex-col gap-3">
            {DAY_LABELS.map((label, dayOfWeek) => {
              const existing = hoursByDay.get(dayOfWeek)
              return (
                <div key={dayOfWeek} className="grid grid-cols-3 items-center gap-3 text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <Input type="time" name={`open_${dayOfWeek}`} defaultValue={minutesToTime(existing?.open_minute ?? null)} />
                  <Input type="time" name={`close_${dayOfWeek}`} defaultValue={minutesToTime(existing?.close_minute ?? null)} />
                </div>
              )
            })}
            <p className="text-xs text-muted-foreground">Leave both fields blank for a day to mark it closed.</p>
            <Button type="submit" className="mt-1 w-fit">
              Save hours
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
