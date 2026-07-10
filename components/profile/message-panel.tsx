'use client'

import { useEffect, useRef, useState, useTransition } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/components/store-provider'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'
import { sendCustomerMessage } from '@/lib/supabase/actions/social'
import { cn } from '@/lib/utils'

export interface ThreadMessage {
  id: string
  from: 'user' | 'business'
  text: string
}

export function MessagePanel({
  businessId,
  businessName,
  isOwner,
  initialMessages = [],
}: {
  /** Supabase businesses.id (UUID) */
  businessId: string
  businessName: string
  isOwner: boolean
  initialMessages?: ThreadMessage[]
}) {
  const { user } = useStore()
  const [thread, setThread] = useState(initialMessages)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setThread(initialMessages)
  }, [initialMessages])

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim() || isOwner) return
    const body = text.trim()
    setText('')
    setError(null)

    const optimistic: ThreadMessage = {
      id: `temp-${Date.now()}`,
      from: 'user',
      text: body,
    }
    setThread((prev) => [...prev, optimistic])

    startTransition(async () => {
      try {
        await sendCustomerMessage(businessId, body)
      } catch (err) {
        setThread((prev) => prev.filter((m) => m.id !== optimistic.id))
        setError(err instanceof Error ? err.message : 'Failed to send')
      }
    })
  }

  if (isOwner) {
    return (
      <section className="rounded-2xl border border-border bg-card p-6">
        <div className="flex items-center gap-2">
          <MessageCircle className="size-5 text-primary" aria-hidden="true" />
          <div>
            <h2 className="font-serif text-lg font-semibold text-card-foreground">Messages</h2>
            <p className="text-sm text-muted-foreground">
              This is your listing. Reply to customers from your{' '}
              <a href="/dashboard/messages" className="font-medium text-primary hover:underline">
                business inbox
              </a>
              .
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-6">
        <MessageCircle className="size-5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-lg font-semibold text-card-foreground">Message {businessName}</h2>
          <p className="text-xs text-muted-foreground">Typically replies within a few hours</p>
        </div>
      </div>

      {user ? (
        <>
          <div ref={scrollRef} className="flex max-h-80 min-h-40 flex-col gap-3 overflow-y-auto p-6">
            {thread.length === 0 ? (
              <div className="m-auto text-center text-sm text-muted-foreground">
                <p>Start the conversation.</p>
                <p>Ask about availability, bookings, or anything else.</p>
              </div>
            ) : (
              thread.map((m) => (
                <div key={m.id} className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}>
                  <div
                    className={cn(
                      'max-w-[80%] rounded-2xl px-4 py-2 text-sm leading-relaxed',
                      m.from === 'user'
                        ? 'rounded-br-sm bg-primary text-primary-foreground'
                        : 'rounded-bl-sm bg-secondary text-secondary-foreground',
                    )}
                  >
                    {m.text}
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border p-4">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message..."
              className="bg-background"
              aria-label="Message"
              disabled={pending}
            />
            <Button type="submit" size="icon" disabled={!text.trim() || pending} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
          {error ? <p className="px-4 pb-3 text-sm text-destructive">{error}</p> : null}
        </>
      ) : (
        <div className="p-6">
          <SignInPrompt message={`Sign in to message ${businessName} directly.`} />
        </div>
      )}
    </section>
  )
}
