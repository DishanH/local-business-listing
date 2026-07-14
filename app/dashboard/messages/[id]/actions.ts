'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function rateCustomer(conversationId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const rating = Number(formData.get('rating'))
  const body = String(formData.get('body') ?? '').trim() || null
  if (!Number.isFinite(rating) || rating < 1 || rating > 5) {
    throw new Error('Rating must be between 1 and 5')
  }

  const { data: conversation } = await supabase
    .from('conversations')
    .select('id, business_id, customer_id')
    .eq('id', conversationId)
    .single()
  if (!conversation) throw new Error('Conversation not found')

  if (conversation.customer_id === user.id) {
    throw new Error('You cannot rate yourself')
  }

  const { error } = await supabase.from('customer_ratings').upsert(
    {
      customer_id: conversation.customer_id,
      rater_id: user.id,
      business_id: conversation.business_id,
      rating,
      body,
    },
    { onConflict: 'customer_id,rater_id' },
  )
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath('/dashboard/messages')
}

export async function sendBusinessReply(conversationId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const body = String(formData.get('body') ?? '').trim()
  if (!body) return

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_type: 'business',
    body,
  })
  if (error) throw new Error(error.message)

  await supabase.from('conversations').update({ business_unread_count: 0 }).eq('id', conversationId)

  const { data: conversation } = await supabase
    .from('conversations')
    .select('business_id')
    .eq('id', conversationId)
    .maybeSingle()
  const { data: business } = conversation
    ? await supabase.from('businesses').select('slug').eq('id', conversation.business_id).maybeSingle()
    : { data: null }

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath('/dashboard/messages')
  revalidatePath('/messages')
  if (business?.slug) revalidatePath(`/business/${business.slug}`)
}
