import { ChefHat, Sparkles } from 'lucide-react'
import type { MenuSection, WeeklySpecial } from '@/lib/types'
import { Badge } from '@/components/ui/badge'

export function MenuPanel({
  weeklySpecials,
  menu,
}: {
  weeklySpecials?: WeeklySpecial[]
  menu?: MenuSection[]
}) {
  const hasSpecials = !!weeklySpecials?.length
  const hasMenu = !!menu?.length
  if (!hasSpecials && !hasMenu) return null

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <ChefHat className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Menu &amp; specials</h2>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">A taste of what&apos;s cooking. Menu updates seasonally.</p>

      {hasSpecials ? (
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="size-4 text-primary" aria-hidden="true" />
            <h3 className="text-sm font-semibold text-card-foreground">This week&apos;s specials</h3>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {weeklySpecials!.map((s) => (
              <div
                key={`${s.day}-${s.name}`}
                className="flex flex-col rounded-xl border border-border bg-secondary/50 p-3"
              >
                <span className="text-xs font-semibold uppercase tracking-wide text-primary">{s.day}</span>
                <span className="mt-1 text-sm font-medium leading-tight text-card-foreground text-pretty">
                  {s.name}
                </span>
                {s.description ? (
                  <span className="mt-1 text-xs leading-snug text-muted-foreground text-pretty">{s.description}</span>
                ) : null}
                <span className="mt-2 text-sm font-semibold text-card-foreground">{s.price}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {hasMenu ? (
        <div className="flex flex-col gap-6">
          {menu!.map((section) => (
            <div key={section.name}>
              <h3 className="mb-3 border-b border-border pb-2 font-serif text-base font-semibold text-card-foreground">
                {section.name}
              </h3>
              <ul className="flex flex-col gap-3">
                {section.items.map((item) => (
                  <li key={item.name} className="flex items-baseline justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-medium text-card-foreground">{item.name}</span>
                        {item.tag ? (
                          <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/10">
                            {item.tag}
                          </Badge>
                        ) : null}
                      </div>
                      {item.description ? (
                        <p className="text-sm leading-snug text-muted-foreground text-pretty">{item.description}</p>
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
      ) : null}
    </section>
  )
}
