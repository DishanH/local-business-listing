'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/components/store-provider'

export function NotesPanel({ businessId }: { businessId: string }) {
  const { getNote, setNote } = useStore()
  const saved = getNote(businessId)
  const [draft, setDraft] = useState(saved)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    setDraft(getNote(businessId))
  }, [businessId, getNote])

  const dirty = draft !== saved

  function handleSave() {
    setNote(businessId, draft)
    setJustSaved(true)
    window.setTimeout(() => setJustSaved(false), 1600)
  }

  return (
    <section className="rounded-2xl border border-border bg-secondary/60 p-6">
      <div className="mb-3 flex items-center gap-2">
        <Pencil className="size-5 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-lg font-semibold text-card-foreground">Your private notes</h2>
      </div>
      <p className="mb-3 text-sm text-muted-foreground">
        Jot down anything you want to remember — a favorite dish, parking tips, or who to ask for. Only you can see this.
      </p>
      <Textarea
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Add a personal note..."
        rows={3}
        className="resize-none bg-background"
      />
      <div className="mt-3 flex items-center gap-3">
        <Button onClick={handleSave} disabled={!dirty} size="sm">
          Save note
        </Button>
        {justSaved ? (
          <span className="inline-flex items-center gap-1 text-sm text-primary">
            <Check className="size-4" aria-hidden="true" /> Saved
          </span>
        ) : null}
      </div>
    </section>
  )
}
