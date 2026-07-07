'use client'

import { useEffect, useRef, useState } from 'react'
import { MessageCircle, Send } from 'lucide-react'
import type { Business } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/components/store-provider'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'
import { cn } from '@/lib/utils'

export function MessagePanel({ business }: { business: Business }) {
  const { user, getThread, sendMessage } = useStore()
  const thread = getThread(business.id)
  const [text, setText] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })
  }, [thread.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    sendMessage(business.id, text)
    setText('')
  }

  return (
    <section className="flex flex-col rounded-2xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border p-6">
        <MessageCircle className="size-5 text-primary" aria-hidden="true" />
        <div>
          <h2 className="font-serif text-lg font-semibold text-card-foreground">Message {business.name}</h2>
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
                <div
                  key={m.id}
                  className={cn('flex', m.from === 'user' ? 'justify-end' : 'justify-start')}
                >
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
            />
            <Button type="submit" size="icon" disabled={!text.trim()} aria-label="Send message">
              <Send className="size-4" />
            </Button>
          </form>
        </>
      ) : (
        <div className="p-6">
          <SignInPrompt message={`Sign in to message ${business.name} directly.`} />
        </div>
      )}
    </section>
  )
}
