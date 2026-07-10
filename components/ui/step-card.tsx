'use client'

import { useState, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

import { cn } from '@/lib/utils'

export type StepStatusTone = 'done' | 'pending' | 'empty' | 'attention'

export interface StepStatus {
  label: string
  tone?: StepStatusTone
}

const toneClasses: Record<StepStatusTone, string> = {
  done: 'bg-primary/10 text-primary',
  pending: 'bg-amber-500/15 text-amber-700 dark:text-amber-400',
  empty: 'bg-muted text-muted-foreground',
  attention: 'bg-destructive/10 text-destructive',
}

/**
 * A collapsible "step" card: a clickable summary row (icon, title, status pill)
 * that expands to reveal the editable content. Used to turn long editor forms
 * into a scannable, click-to-edit list of steps.
 */
export function StepCard({
  icon,
  title,
  description,
  status,
  defaultOpen = false,
  open: openProp,
  onOpenChange,
  children,
}: {
  icon: ReactNode
  title: string
  description?: string
  status?: StepStatus
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: ReactNode
}) {
  const [internalOpen, setInternalOpen] = useState(defaultOpen)
  const open = openProp ?? internalOpen

  function toggle() {
    const next = !open
    if (onOpenChange) onOpenChange(next)
    else setInternalOpen(next)
  }

  return (
    <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
      <button
        type="button"
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 p-4 text-left transition-colors hover:bg-accent/40"
      >
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent text-primary">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium">{title}</h3>
            {status && (
              <span
                className={cn(
                  'inline-flex h-5 shrink-0 items-center rounded-full px-2 text-xs font-medium',
                  toneClasses[status.tone ?? 'empty'],
                )}
              >
                {status.label}
              </span>
            )}
          </div>
          {description && <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown
          size={18}
          className={cn('shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && <div className="border-t border-border p-4 sm:p-5">{children}</div>}
    </div>
  )
}
