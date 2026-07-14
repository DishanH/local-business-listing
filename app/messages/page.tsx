import Link from 'next/link'
import { redirect } from 'next/navigation'
import { MessageSquare } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatWhen(value: string | null) {
  if (!value) return ''
  const date = new Date(value)
  const diffMs = Date.now() - date.getTime()
  const diffMins = Math.round(diffMs / 60000)
  if (diffMins < 1) return 'Just now'
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.round(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.round(diffHours / 24)
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

async function getCustomerConversations(userId: string) {
  const supabase = await createClient()
  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .eq('customer_id', userId)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (!conversations?.length) return []

  const businessIds = [...new Set(conversations.map((c) => c.business_id))]
  const { data: businesses } = await supabase
    .from('businesses')
    .select('id, name, slug, cover_image_url')
    .in('id', businessIds)

  const businessById = new Map((businesses ?? []).map((b) => [b.id, b]))

  return conversations.map((conversation) => {
    const business = businessById.get(conversation.business_id)
    return {
      ...conversation,
      businessName: business?.name ?? 'Business',
      businessSlug: business?.slug ?? '',
    }
  })
}

export default async function CustomerMessagesPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/messages')

  const conversations = await getCustomerConversations(user.id)

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <div className="mb-5">
        <h1 className="text-2xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Your conversations with local businesses.</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-12 text-center shadow-none">
          <span className="flex size-12 items-center justify-center rounded-full bg-accent text-primary">
            <MessageSquare className="size-5" />
          </span>
          <p className="font-medium">No messages yet</p>
          <p className="text-sm text-muted-foreground">
            Message a business from its profile page to start a conversation.
          </p>
          <Link href="/search" className="mt-2 text-sm font-medium text-primary hover:underline">
            Browse businesses →
          </Link>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden p-0 shadow-none">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/messages/${conversation.id}`}
              className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-muted/40"
            >
              <Avatar className="size-10 shrink-0">
                <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                  {initials(conversation.businessName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate font-medium">{conversation.businessName}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatWhen(conversation.last_message_at)}
                  </span>
                </div>
                <p className="truncate text-sm text-muted-foreground">View conversation</p>
              </div>
              {conversation.customer_unread_count > 0 && (
                <Badge className="shrink-0">{conversation.customer_unread_count}</Badge>
              )}
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
