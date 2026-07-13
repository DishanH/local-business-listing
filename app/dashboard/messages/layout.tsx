import { MessagesList } from './messages-list'
import { MessagesSplit } from './messages-split'
import { getBusinessesForOwner } from '@/lib/supabase/queries/businesses'
import { createClient } from '@/lib/supabase/server'
import { Separator } from '@/components/ui/separator'

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

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const conversations = await getConversations()

  const list = (
    <>
      <div className="flex h-14 shrink-0 items-center justify-between px-4">
        <div>
          <h2 className="text-sm font-semibold">Inbox</h2>
          <p className="text-xs text-muted-foreground">{conversations.length} conversations</p>
        </div>
      </div>
      <Separator />
      <div className="min-h-0 flex-1">
        <MessagesList conversations={conversations} />
      </div>
    </>
  )

  return <MessagesSplit list={list}>{children}</MessagesSplit>
}
