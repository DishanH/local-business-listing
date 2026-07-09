import { notFound } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'

import { sendBusinessReply } from './actions'

async function getThread(conversationId: string) {
  const supabase = await createClient()
  const { data: conversation } = await supabase.from('conversations').select('*').eq('id', conversationId).single()
  if (!conversation) return null

  const [{ data: messages }, { data: business }] = await Promise.all([
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'),
    supabase.from('businesses').select('name').eq('id', conversation.business_id).single(),
  ])

  return { conversation, messages: messages ?? [], businessName: business?.name ?? '' }
}

export default async function ConversationThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const thread = await getThread(id)
  if (!thread) notFound()

  const { messages, businessName } = thread

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Conversation</h2>
        <p className="text-sm text-muted-foreground">{businessName}</p>
      </div>

      <Card className="flex flex-col gap-3 p-4">
        {messages.length === 0 && <p className="text-sm text-muted-foreground">No messages yet.</p>}
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn(
              'max-w-[80%] rounded-2xl px-3.5 py-2 text-sm',
              message.sender_type === 'business'
                ? 'ml-auto bg-primary text-primary-foreground'
                : 'bg-muted text-foreground',
            )}
          >
            {message.body}
          </div>
        ))}
      </Card>

      <form action={sendBusinessReply.bind(null, id)} className="flex flex-col gap-2">
        <Textarea name="body" placeholder="Write a reply…" rows={3} required />
        <Button type="submit" className="w-fit">
          Send reply
        </Button>
      </form>
    </div>
  )
}
