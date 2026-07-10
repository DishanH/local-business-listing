'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, CornerDownLeft, Search } from 'lucide-react'
import { CategoryIcon } from '@/components/category-icon'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { useStore } from '@/components/store-provider'
import { suggest } from '@/lib/search'

const quickChips = ['restaurants', 'cafe', 'bakery', 'yoga', 'salon']

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const { categories, businesses } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)
  const [q, setQ] = useState('')

  const suggestions = useMemo(() => (q.trim() ? suggest(businesses, q, categories, 6) : []), [businesses, categories, q])

  useEffect(() => {
    if (!open) {
      setQ('')
      return
    }
    const t = window.setTimeout(() => inputRef.current?.focus(), 50)
    return () => window.clearTimeout(t)
  }, [open])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        onOpenChange(true)
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onOpenChange])

  function go(query: string) {
    onOpenChange(false)
    router.push(query.trim() ? `/search?q=${encodeURIComponent(query.trim())}` : '/search')
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="top-[12%] max-w-xl translate-y-0 p-0 sm:top-[14%]"
        showClose={false}
      >
        <form
          onSubmit={(e) => {
            e.preventDefault()
            go(q)
          }}
          className="border-b border-border"
        >
          <div className="flex items-center gap-3 px-4 py-3">
            <Search size={20} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search businesses..."
              aria-label="Search businesses"
              className="min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <kbd className="hidden rounded-md border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground sm:inline">
              ESC
            </kbd>
          </div>
        </form>

        <div className="max-h-[min(60vh,22rem)] overflow-y-auto p-2">
          {suggestions.length > 0 ? (
            <ul className="flex flex-col gap-0.5">
              {suggestions.map((b) => {
                const cat = categories.find((c) => c.id === b.categoryId)
                return (
                  <li key={b.id}>
                    <Link
                      href={`/business/${b.id}`}
                      onClick={() => onOpenChange(false)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors hover:bg-accent"
                    >
                      <span className="relative size-9 shrink-0 overflow-hidden rounded-lg">
                        <Image src={b.image || '/placeholder.svg'} alt="" fill className="object-cover" sizes="36px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">{b.name}</span>
                        <span className="block truncate text-xs text-muted-foreground">{cat?.name}</span>
                      </span>
                      <CornerDownLeft size={14} className="text-muted-foreground" />
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : q.trim() ? (
            <button
              type="button"
              onClick={() => go(q)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors hover:bg-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Search size={16} />
              </span>
              <span>
                Search for <span className="font-medium">&ldquo;{q}&rdquo;</span>
              </span>
              <ArrowRight size={14} className="ml-auto text-muted-foreground" />
            </button>
          ) : (
            <div className="px-2 py-1">
              <p className="px-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">Popular</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {quickChips.map((id) => {
                  const cat = categories.find((c) => c.id === id)
                  if (!cat) return null
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => {
                        onOpenChange(false)
                        router.push(`/search?category=${id}`)
                      }}
                      className="inline-flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm transition-colors hover:border-primary hover:text-primary"
                    >
                      <CategoryIcon name={cat.icon} size={14} />
                      {cat.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-border px-4 py-2.5 text-xs text-muted-foreground">
          <span>
            <kbd className="rounded border bg-muted px-1 py-0.5 font-medium">↵</kbd> to search
          </span>
          <span className="hidden sm:inline">
            <kbd className="rounded border bg-muted px-1 py-0.5 font-medium">⌘</kbd>
            <kbd className="ml-0.5 rounded border bg-muted px-1 py-0.5 font-medium">K</kbd> anytime
          </span>
        </div>
      </DialogContent>
    </Dialog>
  )
}
