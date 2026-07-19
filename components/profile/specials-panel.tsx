import Link from 'next/link'
import { Sparkles } from 'lucide-react'
import type { WeeklySpecial } from '@/lib/types'
import { defaultSpecialsIntro } from '@/lib/section-copy'
import { Button } from '@/components/ui/button'
import { SectionEditLink } from '@/components/profile/section-edit-link'

export function SpecialsPanel({
  weeklySpecials,
  intro,
  categorySlug,
  isOwner,
  manageHref,
}: {
  weeklySpecials?: WeeklySpecial[]
  intro?: string | null
  categorySlug?: string
  isOwner?: boolean
  manageHref?: string
}) {
  const hasSpecials = !!weeklySpecials?.length

  if (!hasSpecials) {
    if (!isOwner) return null
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="mb-1 flex items-center gap-2">
          <Sparkles className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">Specials</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Only you can see this. Add a happy hour or daily deal and it&apos;ll show here for customers.
        </p>
        {manageHref ? (
          <Link href={manageHref}>
            <Button variant="outline" size="sm">
              Add a special
            </Button>
          </Link>
        ) : null}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Sparkles className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Specials</h2>
        {isOwner && manageHref ? <SectionEditLink href={manageHref} /> : null}
      </div>
      <p className="mb-5 text-sm text-muted-foreground">{intro || defaultSpecialsIntro(categorySlug)}</p>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {weeklySpecials!.map((s, i) => (
          <div
            key={`${s.day}-${s.name}-${i}`}
            className="flex flex-col rounded-xl border border-border bg-secondary/50 p-3"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">{s.day}</span>
            <span className="mt-1 break-words text-sm font-medium leading-tight text-card-foreground text-pretty">
              {s.name}
            </span>
            {s.description ? (
              <span className="mt-1 break-words text-xs leading-snug text-muted-foreground text-pretty">
                {s.description}
              </span>
            ) : null}
            <span className="mt-2 text-sm font-semibold text-card-foreground">{s.price}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
