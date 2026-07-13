'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

/**
 * Toggle a favorite for the signed-in user.
 * `slug` is the public business id used in the UI; `dbId` is the UUID when known.
 * Returns the new favorited state. Throws `DEMO_LISTING` for mock-only businesses.
 */
export async function toggleFavorite(slug: string, dbId?: string | null) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  let businessUuid = dbId ?? null
  if (!businessUuid) {
    const { data: row } = await supabase.from('businesses').select('id').eq('slug', slug).maybeSingle()
    businessUuid = row?.id ?? null
  }
  if (!businessUuid) throw new Error('DEMO_LISTING')

  const { data: existing } = await supabase
    .from('favorites')
    .select('business_id')
    .eq('profile_id', user.id)
    .eq('business_id', businessUuid)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('profile_id', user.id)
      .eq('business_id', businessUuid)
    if (error) throw new Error(error.message)
    revalidatePath('/favorites')
    return { favorited: false as const }
  }

  const { error } = await supabase.from('favorites').insert({
    profile_id: user.id,
    business_id: businessUuid,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/favorites')
  return { favorited: true as const }
}

export async function saveNote(businessId: string, body: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('notes').upsert(
    {
      profile_id: user.id,
      business_id: businessId,
      body,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'profile_id,business_id' },
  )
  if (error) throw new Error(error.message)
  revalidatePath(`/business`)
}

export async function addReview(businessId: string, rating: number, body: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('reviews').upsert(
    {
      business_id: businessId,
      author_id: user.id,
      rating,
      body,
    },
    { onConflict: 'business_id,author_id' },
  )
  if (error) throw new Error(error.message)
  revalidatePath(`/business`)
}

export async function replyToReview(reviewId: string, businessId: string, reply: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase
    .from('reviews')
    .update({
      owner_reply: reply.trim() || null,
      owner_reply_at: reply.trim() ? new Date().toISOString() : null,
    })
    .eq('id', reviewId)
    .eq('business_id', businessId)

  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/listings/${businessId}`)
  revalidatePath(`/business`)
}

export async function sendCustomerMessage(businessId: string, body: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Owners should not message their own listing from the public profile.
  const { data: ownership } = await supabase
    .from('business_owners')
    .select('business_id')
    .eq('business_id', businessId)
    .eq('profile_id', user.id)
    .maybeSingle()
  if (ownership) throw new Error('You cannot message your own business')

  let conversationId: string
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('business_id', businessId)
    .eq('customer_id', user.id)
    .maybeSingle()

  if (existing) {
    conversationId = existing.id
  } else {
    const { data: created, error: createError } = await supabase
      .from('conversations')
      .insert({ business_id: businessId, customer_id: user.id })
      .select('id')
      .single()
    if (createError) throw new Error(createError.message)
    conversationId = created.id
  }

  const { error } = await supabase.from('messages').insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_type: 'customer',
    body: body.trim(),
  })
  if (error) throw new Error(error.message)

  await supabase.from('conversations').update({ customer_unread_count: 0 }).eq('id', conversationId)
}
