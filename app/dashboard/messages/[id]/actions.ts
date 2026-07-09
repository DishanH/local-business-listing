'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

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

  revalidatePath(`/dashboard/messages/${conversationId}`)
  revalidatePath('/dashboard/messages')
}
