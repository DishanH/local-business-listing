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

  // Chunk `.in()` - large ownership sets overflow PostgREST URL/header limits.
  const CHUNK = 80
  const conversations: {
    id: string
    business_id: string
    customer_id: string
    last_message_at: string | null
    business_unread_count: number
    customer_unread_count: number
    created_at: string
  }[] = []

  for (let i = 0; i < businessIds.length; i += CHUNK) {
    const chunk = businessIds.slice(i, i + CHUNK)
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .in('business_id', chunk)
      .order('last_message_at', { ascending: false, nullsFirst: false })
    if (error) throw new Error(error.message)
    if (data?.length) conversations.push(...data)
  }

  conversations.sort((a, b) => {
    const at = a.last_message_at ? Date.parse(a.last_message_at) : 0
    const bt = b.last_message_at ? Date.parse(b.last_message_at) : 0
    return bt - at
  })

  if (!conversations.length) return []

  const customerIds = [...new Set(conversations.map((c) => c.customer_id))]
  let customers: {
    id: string
    full_name: string | null
    customer_avg_rating?: number
    customer_rating_count?: number
  }[] = []

  const withRatings = await supabase
    .from('profiles')
    .select('id, full_name, customer_avg_rating, customer_rating_count')
    .in('id', customerIds)

  if (withRatings.error) {
    const fallback = await supabase.from('profiles').select('id, full_name').in('id', customerIds)
    customers = fallback.data ?? []
  } else {
    customers = withRatings.data ?? []
  }

  const businessNames = new Map(owned.map((row) => [row.business.id, row.business.name]))
  const profileById = new Map(customers.map((c) => [c.id, c]))

  return conversations.map((conversation) => {
    const profile = profileById.get(conversation.customer_id)
    return {
      ...conversation,
      customerName: profile?.full_name ?? 'Customer',
      businessName: businessNames.get(conversation.business_id) ?? '',
      customerAvgRating: profile?.customer_avg_rating ?? 0,
      customerRatingCount: profile?.customer_rating_count ?? 0,
    }
  })
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
