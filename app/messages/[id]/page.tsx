import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

import { sendCustomerReply } from './actions'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

async function getThread(conversationId: string, userId: string) {
  const supabase = await createClient()
  const { data: conversation } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .eq('customer_id', userId)
    .single()
  if (!conversation) return null

  const [{ data: messages, error: messagesError }, { data: business }] = await Promise.all([
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'),
    supabase.from('businesses').select('name, slug').eq('id', conversation.business_id).single(),
  ])

  if (messagesError) console.error('Failed to load messages', messagesError.message)

  if ((conversation.customer_unread_count ?? 0) > 0) {
    await supabase.from('conversations').update({ customer_unread_count: 0 }).eq('id', conversationId)
  }

  return {
    conversation,
    messages: messages ?? [],
    businessName: business?.name ?? 'Business',
    businessSlug: business?.slug ?? '',
  }
}

export default async function CustomerConversationPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/messages/${id}`)

  const thread = await getThread(id, user.id)
  if (!thread) notFound()

  const { messages, businessName, businessSlug } = thread

  return (
    <div className="mx-auto flex h-[calc(100dvh-3.5rem)] max-w-3xl flex-col sm:h-[calc(100dvh-4rem)] sm:px-6 sm:py-6">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden border-y bg-card sm:rounded-xl sm:border">
        <div className="flex shrink-0 items-center gap-3 border-b px-4 py-3">
          <Link href="/messages">
            <Button variant="ghost" size="icon" className="size-8">
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <Avatar className="size-8">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(businessName)}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{businessName}</p>
            {businessSlug && (
              <Link href={`/business/${businessSlug}`} className="text-xs text-primary hover:underline">
                View listing
              </Link>
            )}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <div className="flex flex-col gap-2">
            {messages.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No messages yet.</p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    'flex gap-2',
                    message.sender_type === 'customer' ? 'justify-end' : 'justify-start',
                  )}
                >
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                      message.sender_type === 'customer'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-foreground',
                    )}
                  >
                    {message.body}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="shrink-0 border-t p-4">
          <form action={sendCustomerReply.bind(null, id)} className="flex flex-col gap-2">
            <Textarea name="body" placeholder="Type your message..." rows={2} className="resize-none" required />
            <div className="flex justify-end">
              <Button type="submit" size="sm">
                Send
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
