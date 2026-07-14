'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function sendCustomerReply(conversationId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const body = String(formData.get('body') ?? '').trim()
  if (!body) return

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, business_id, customer_id')
    .eq('id', conversationId)
    .eq('customer_id', user.id)
    .single()
  if (!conversation) throw new Error('Conversation not found')

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_type: 'customer',
    body,
  })
  if (error) throw new Error(error.message)

  await supabase.from('conversations').update({ customer_unread_count: 0 }).eq('id', conversationId)

  const { data: business } = await supabase
    .from('businesses')
    .select('slug')
    .eq('id', conversation.business_id)
    .maybeSingle()

  revalidatePath(`/messages/${conversationId}`)
  revalidatePath('/messages')
  revalidatePath('/dashboard/messages')
  if (business?.slug) revalidatePath(`/business/${business.slug}`)
}
