import Link from 'next/link'
import { MessageSquare } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { getBusinessesForOwner } from '@/lib/supabase/queries/businesses'
import { createClient } from '@/lib/supabase/server'

async function getConversations() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const owned = await getBusinessesForOwner(user.id)
  const businessIds = owned.map((row) => row.business.id)
  if (businessIds.length === 0) return []

  const { data: conversations } = await supabase
    .from('conversations')
    .select('*')
    .in('business_id', businessIds)
    .order('last_message_at', { ascending: false, nullsFirst: false })

  if (!conversations?.length) return []

  const customerIds = [...new Set(conversations.map((c) => c.customer_id))]
  const [{ data: customers }, businessNames] = await Promise.all([
    supabase.from('profiles').select('id, full_name').in('id', customerIds),
    new Map(owned.map((row) => [row.business.id, row.business.name])),
  ])

  const nameByCustomerId = new Map((customers ?? []).map((c) => [c.id, c.full_name]))

  return conversations.map((conversation) => ({
    ...conversation,
    customerName: nameByCustomerId.get(conversation.customer_id) ?? 'Customer',
    businessName: businessNames.get(conversation.business_id) ?? '',
  }))
}

export default async function DashboardMessagesPage() {
  const conversations = await getConversations()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Messages</h2>
        <p className="text-sm text-muted-foreground">Conversations from customers across all of your listings.</p>
      </div>

      {conversations.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center text-muted-foreground">
          <MessageSquare className="size-8" />
          <p>No conversations yet.</p>
        </Card>
      ) : (
        <Card className="divide-y overflow-hidden p-0">
          {conversations.map((conversation) => (
            <Link
              key={conversation.id}
              href={`/dashboard/messages/${conversation.id}`}
              className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-muted/40"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">{conversation.customerName}</p>
                <p className="truncate text-sm text-muted-foreground">{conversation.businessName}</p>
              </div>
              {conversation.business_unread_count > 0 && (
                <Badge>{conversation.business_unread_count} new</Badge>
              )}
            </Link>
          ))}
        </Card>
      )}
    </div>
  )
}
