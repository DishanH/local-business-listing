import type { ReactNode } from 'react'

/**
 * Sticky header + flush scrollable body - the same structural pattern used by
 * `dashboard/listings/[id]` so every admin section feels consistent with the
 * listing editor rather than a plain padded page.
 */
export function AdminPageShell({
  title,
  description,
  actions,
  children,
}: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold tracking-tight">{title}</h2>
          {description ? (
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">{children}</div>
    </div>
  )
}
