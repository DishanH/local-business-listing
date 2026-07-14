'use client'

import { useState } from 'react'
import { ChevronDown, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

import { rateCustomer } from '@/app/dashboard/messages/[id]/actions'

export function RateCustomerForm({
  conversationId,
  initialRating,
  initialBody,
}: {
  conversationId: string
  initialRating?: number | null
  initialBody?: string | null
}) {
  const [open, setOpen] = useState(false)
  const [stars, setStars] = useState(initialRating ?? 0)
  const [hover, setHover] = useState(0)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saved, setSaved] = useState(Boolean(initialRating))

  async function onSubmit(formData: FormData) {
    setError(null)
    if (stars < 1) {
      setError('Pick a star rating')
      return
    }
    formData.set('rating', String(stars))
    setPending(true)
    try {
      await rateCustomer(conversationId, formData)
      setSaved(true)
      setOpen(false)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save rating')
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="rounded-xl border bg-muted/20">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left"
      >
        <span className="text-xs font-semibold">
          {saved ? (
            <span className="inline-flex items-center gap-1.5">
              Your rating
              <span className="inline-flex items-center gap-0.5 font-medium text-amber-600 dark:text-amber-400">
                <Star size={12} className="fill-current" />
                {stars}.0
              </span>
            </span>
          ) : (
            'Rate this customer'
          )}
        </span>
        <ChevronDown size={14} className={cn('text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <form action={onSubmit} className="flex flex-col gap-2.5 border-t px-3 py-2.5">
          <div className="flex items-center justify-between gap-2">
            <p className="text-[11px] text-muted-foreground">Help other owners know what to expect</p>
            <div className="flex items-center gap-0.5" onMouseLeave={() => setHover(0)}>
              {[1, 2, 3, 4, 5].map((n) => {
                const active = (hover || stars) >= n
                return (
                  <button
                    key={n}
                    type="button"
                    aria-label={`${n} stars`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => setStars(n)}
                    className="rounded p-0.5 text-muted-foreground transition-colors hover:text-amber-500"
                  >
                    <Star size={16} className={cn(active && 'fill-amber-500 text-amber-500')} />
                  </button>
                )
              })}
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="rate-body" className="text-xs text-muted-foreground">
              Optional note
            </Label>
            <Textarea
              id="rate-body"
              name="body"
              rows={2}
              defaultValue={initialBody ?? ''}
              placeholder="Reliable, clear communicator…"
              className="resize-none text-sm"
            />
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <Button type="submit" size="sm" className="w-fit" disabled={pending}>
            {pending ? 'Saving…' : saved ? 'Update rating' : 'Save rating'}
          </Button>
        </form>
      )}
    </div>
  )
}
