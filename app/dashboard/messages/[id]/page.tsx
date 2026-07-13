import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

import { sendBusinessReply } from './actions'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

async function getThread(conversationId: string) {
  const supabase = await createClient()
  const { data: conversation } = await supabase.from('conversations').select('*').eq('id', conversationId).single()
  if (!conversation) return null

  const [{ data: messages }, { data: business }, { data: customer }] = await Promise.all([
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'),
    supabase.from('businesses').select('name').eq('id', conversation.business_id).single(),
    supabase.from('profiles').select('full_name').eq('id', conversation.customer_id).single(),
  ])

  return { 
    conversation, 
    messages: messages ?? [], 
    businessName: business?.name ?? '',
    customerName: customer?.full_name ?? 'Customer'
  }
}

export default async function ConversationThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const thread = await getThread(id)
  if (!thread) notFound()

  const { messages, businessName, customerName } = thread

  return (
    <div className="flex h-full min-h-0 flex-col">
      {/* Header */}
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
        <Link href="/dashboard/messages" className="md:hidden">
          <Button variant="ghost" size="icon" className="size-8">
            <ArrowLeft className="size-4" />
          </Button>
        </Link>
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(customerName)}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{customerName}</p>
          <p className="truncate text-xs text-muted-foreground">{businessName}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {messages.length === 0 && (
            <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
          )}
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-2',
                message.sender_type === 'business' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[70%] rounded-2xl px-3 py-2 text-sm',
                  message.sender_type === 'business'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-foreground',
                )}
              >
                {message.body}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reply Form */}
      <div className="shrink-0 border-t p-4">
        <form action={sendBusinessReply.bind(null, id)} className="flex flex-col gap-2">
          <Textarea
            name="body"
            placeholder="Type your message..."
            rows={2}
            className="resize-none"
            required
          />
          <div className="flex justify-end">
            <Button type="submit" size="sm">
              Send
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
