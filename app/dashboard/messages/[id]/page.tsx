import { notFound } from 'next/navigation'
import { ArrowLeft, MessageSquareText, PenLine } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RateCustomerForm } from '@/components/dashboard/rate-customer-form'
import { StarRating } from '@/components/dashboard/star-rating'
import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { getCustomerReputation, type CustomerReputation } from '@/lib/supabase/queries/customers'

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
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: conversation, error: conversationError } = await supabase
    .from('conversations')
    .select('*')
    .eq('id', conversationId)
    .single()
  if (conversationError || !conversation) return null

  const [{ data: messages, error: messagesError }, { data: business }] = await Promise.all([
    supabase.from('messages').select('*').eq('conversation_id', conversationId).order('created_at'),
    supabase.from('businesses').select('name, slug').eq('id', conversation.business_id).single(),
  ])

  if (messagesError) {
    console.error('Failed to load messages', messagesError.message)
  }

  let reputation: CustomerReputation | null = null
  try {
    reputation = await getCustomerReputation(conversation.customer_id, conversation.business_id, user.id)
  } catch (err) {
    console.error('Failed to load customer reputation', err)
  }

  // Mark as read for the business side
  if ((conversation.business_unread_count ?? 0) > 0) {
    await supabase.from('conversations').update({ business_unread_count: 0 }).eq('id', conversationId)
  }

  return {
    conversation,
    messages: messages ?? [],
    businessName: business?.name ?? '',
    businessSlug: business?.slug ?? '',
    reputation,
    customerName: reputation?.fullName ?? 'Customer',
  }
}

export default async function ConversationThreadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const thread = await getThread(id)
  if (!thread) notFound()

  const { messages, businessName, reputation, customerName } = thread

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 items-center gap-3 border-b px-4 py-2.5">
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
        {reputation && reputation.reputationCount > 0 && (
          <StarRating value={reputation.reputationAvg} count={reputation.reputationCount} />
        )}
      </div>

      {reputation && (
        <div className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 border-b bg-muted/15 px-4 py-2 text-[11px] text-muted-foreground">
          <span>
            Joined{' '}
            {new Date(reputation.memberSince).toLocaleDateString(undefined, {
              month: 'short',
              year: 'numeric',
            })}
          </span>
          <span className="inline-flex items-center gap-1">
            <PenLine size={11} />
            {reputation.reviewsWritten} review{reputation.reviewsWritten === 1 ? '' : 's'}
            {reputation.reviewsWritten > 0 && ` · avg ${reputation.reviewsAvgGiven.toFixed(1)}★`}
          </span>
          {reputation.reviewOnThisBusiness ? (
            <span className="inline-flex items-center gap-1 text-foreground">
              Reviewed this listing · {reputation.reviewOnThisBusiness.rating}★
            </span>
          ) : (
            <span className="inline-flex items-center gap-1">
              <MessageSquareText size={11} />
              No review on this listing
            </span>
          )}
        </div>
      )}

      {/* Messages - always keep a usable height */}
      <div className="min-h-[12rem] flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-2">
          {messages.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground">No messages in this thread yet.</p>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  'flex gap-2',
                  message.sender_type === 'business' ? 'justify-end' : 'justify-start',
                )}
              >
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap',
                    message.sender_type === 'business'
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

      <div className="shrink-0 space-y-2 border-t p-3">
        <RateCustomerForm
          conversationId={id}
          initialRating={reputation?.myRating?.rating}
          initialBody={reputation?.myRating?.body}
        />
        <form action={sendBusinessReply.bind(null, id)} className="flex flex-col gap-2">
          <Textarea name="body" placeholder="Type your reply..." rows={2} className="resize-none" required />
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
