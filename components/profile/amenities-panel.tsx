import Link from 'next/link'
import { CheckCircle2, SlidersHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionEditLink } from '@/components/profile/section-edit-link'

export function AmenitiesPanel({
  amenities,
  isOwner,
  manageHref,
}: {
  amenities: { id: string; label: string }[]
  isOwner?: boolean
  manageHref?: string
}) {
  if (!amenities.length) {
    if (!isOwner) return null
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="mb-1 flex items-center gap-2">
          <SlidersHorizontal className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">Amenities</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Only you can see this. Select things like &quot;Wi-Fi&quot; or &quot;Wheelchair accessible&quot; and
          they&apos;ll show here for customers.
        </p>
        {manageHref ? (
          <Link href={manageHref}>
            <Button variant="outline" size="sm">
              Add amenities
            </Button>
          </Link>
        ) : null}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Amenities</h2>
        {isOwner && manageHref ? <SectionEditLink href={manageHref} /> : null}
      </div>
      <p className="mb-4 text-sm text-muted-foreground">What this place offers.</p>
      <div className="flex flex-wrap gap-2">
        {amenities.map((a) => (
          <Badge key={a.id} variant="secondary" className="gap-1.5 py-1.5">
            <CheckCircle2 className="size-3.5 text-primary" aria-hidden="true" />
            {a.label}
          </Badge>
        ))}
      </div>
    </section>
  )
}
