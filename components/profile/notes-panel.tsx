'use client'

import { useEffect, useState } from 'react'
import { Check, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/components/store-provider'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'

export function NotesPanel({ businessId }: { businessId: string }) {
  const { user, getNote, setNote } = useStore()
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
    <section className="rounded-2xl border border-border bg-secondary/60 p-4">
      <div className="mb-2 flex items-center gap-2">
        <Pencil className="size-4 text-primary" aria-hidden="true" />
        <h2 className="font-serif text-base font-semibold text-card-foreground">Your private notes</h2>
        <span className="ml-auto text-xs text-muted-foreground">Only you can see this</span>
      </div>

      {user ? (
        <>
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="A favorite dish, parking tips, who to ask for..."
            rows={2}
            className="resize-none bg-background text-sm"
          />
          <div className="mt-2 flex items-center gap-3">
            <Button onClick={handleSave} disabled={!dirty} size="sm">
              Save note
            </Button>
            {justSaved ? (
              <span className="inline-flex items-center gap-1 text-sm text-primary">
                <Check className="size-4" aria-hidden="true" /> Saved
              </span>
            ) : null}
          </div>
        </>
      ) : (
        <SignInPrompt message="Sign in to save private notes about this place." />
      )}
    </section>
  )
}
