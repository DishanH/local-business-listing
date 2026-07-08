'use client'

import { Check, SlidersHorizontal } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const priceOptions = [
  { value: '1', label: '$', hint: 'Budget' },
  { value: '2', label: '$$', hint: 'Moderate' },
  { value: '3', label: '$$$', hint: 'Pricey' },
  { value: '4', label: '$$$$', hint: 'Splurge' },
]

interface FiltersPopoverProps {
  priceLevels: string[]
  onTogglePrice: (value: string) => void
  openNow: boolean
  onToggleOpenNow: () => void
  onClear: () => void
}

export function FiltersPopover({
  priceLevels,
  onTogglePrice,
  openNow,
  onToggleOpenNow,
  onClear,
}: FiltersPopoverProps) {
  const count = priceLevels.length + (openNow ? 1 : 0)

  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          'inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full border px-3.5 text-sm font-medium transition-colors',
          count > 0 ? 'border-primary bg-accent text-primary' : 'bg-card hover:border-primary',
        )}
      >
        <SlidersHorizontal size={15} />
        <span className="hidden sm:inline">Filters</span>
        {count > 0 && (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
            {count}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent side="bottom" align="end" className="w-72 p-4">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold">Filters</p>
          {count > 0 && (
            <button type="button" onClick={onClear} className="text-xs font-medium text-muted-foreground hover:text-primary">
              Clear
            </button>
          )}
        </div>

        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Price</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {priceOptions.map((p) => {
              const checked = priceLevels.includes(p.value)
              return (
                <button
                  key={p.value}
                  type="button"
                  role="checkbox"
                  aria-checked={checked}
                  onClick={() => onTogglePrice(p.value)}
                  className={cn(
                    'flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors',
                    checked ? 'border-primary bg-accent text-primary' : 'hover:border-primary',
                  )}
                >
                  <span
                    className={cn(
                      'flex size-4 shrink-0 items-center justify-center rounded-[5px] border',
                      checked ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
                    )}
                  >
                    {checked && <Check size={11} strokeWidth={3} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block font-semibold leading-none">{p.label}</span>
                    <span className="block text-xs leading-none text-muted-foreground mt-0.5">{p.hint}</span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4 border-t border-border pt-4">
          <button
            type="button"
            role="checkbox"
            aria-checked={openNow}
            onClick={onToggleOpenNow}
            className="flex w-full items-center gap-2.5 rounded-xl border px-3 py-2.5 text-sm transition-colors hover:border-primary"
          >
            <span
              className={cn(
                'flex size-4 shrink-0 items-center justify-center rounded-[5px] border',
                openNow ? 'border-primary bg-primary text-primary-foreground' : 'border-input',
              )}
            >
              {openNow && <Check size={11} strokeWidth={3} />}
            </span>
            <span className="font-medium">Open now only</span>
          </button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
