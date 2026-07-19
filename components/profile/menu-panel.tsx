import Link from 'next/link'
import { ChefHat } from 'lucide-react'
import type { MenuSection } from '@/lib/types'
import { defaultMenuIntro } from '@/lib/section-copy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SectionEditLink } from '@/components/profile/section-edit-link'

export function MenuPanel({
  menu,
  intro,
  categorySlug,
  isOwner,
  manageHref,
}: {
  menu?: MenuSection[]
  intro?: string | null
  categorySlug?: string
  isOwner?: boolean
  manageHref?: string
}) {
  const hasMenu = !!menu?.length

  if (!hasMenu) {
    if (!isOwner) return null
    return (
      <section className="rounded-2xl border border-dashed border-border bg-card/50 p-6">
        <div className="mb-1 flex items-center gap-2">
          <ChefHat className="size-5 text-muted-foreground" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">Menu</h2>
        </div>
        <p className="mb-4 text-sm text-muted-foreground">
          Only you can see this. Add sections and items and they&apos;ll show here for customers.
        </p>
        {manageHref ? (
          <Link href={manageHref}>
            <Button variant="outline" size="sm">
              Add your menu
            </Button>
          </Link>
        ) : null}
      </section>
    )
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <ChefHat className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Menu</h2>
        {isOwner && manageHref ? <SectionEditLink href={manageHref} /> : null}
      </div>
      <p className="mb-5 text-sm text-muted-foreground">{intro || defaultMenuIntro(categorySlug)}</p>

      <div className="flex flex-col gap-6">
        {menu!.map((section, sectionIndex) => (
          <div key={`${section.name}-${sectionIndex}`}>
            <h3 className="mb-3 border-b border-border pb-2 font-serif text-base font-semibold text-card-foreground">
              {section.name}
            </h3>
            <ul className="flex flex-col gap-3">
              {section.items.map((item, itemIndex) => (
                <li key={`${item.name}-${itemIndex}`} className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="break-words font-medium text-card-foreground">{item.name}</span>
                      {item.tag ? (
                        <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                          {item.tag}
                        </Badge>
                      ) : null}
                    </div>
                    {item.description ? (
                      <p className="break-words text-sm leading-snug text-muted-foreground text-pretty">
                        {item.description}
                      </p>
                    ) : null}
                  </div>
                  <span
                    className="shrink-0 text-sm font-semibold text-card-foreground tabular-nums"
                    aria-label={`Price ${item.price}`}
                  >
                    {item.price}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
