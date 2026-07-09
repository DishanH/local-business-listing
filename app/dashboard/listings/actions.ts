'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createListing(formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Users who signed up before handle_new_user was applied need a profiles row
  // (businesses.created_by references profiles.id).
  await supabase.rpc('ensure_profile')

  const name = String(formData.get('name') ?? '').trim()
  const categoryId = String(formData.get('category_id') ?? '')
  if (!name || !categoryId) throw new Error('Name and category are required')

  const baseSlug = slugify(name) || `business-${Date.now()}`
  let slug = baseSlug
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const { data: existing } = await supabase.from('businesses').select('id').eq('slug', slug).maybeSingle()
    if (!existing) break
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
  }

  const { data, error } = await supabase
    .from('businesses')
    .insert({
      name,
      slug,
      category_id: categoryId,
      status: 'draft',
      created_by: user.id,
    })
    .select('id')
    .single()

  if (error) throw new Error(error.message)

  revalidatePath('/dashboard/listings')
  redirect(`/dashboard/listings/${data.id}`)
}

export async function updateListing(businessId: string, formData: FormData) {
  const supabase = await createClient()

  const priceLevelRaw = String(formData.get('price_level') ?? '')

  const { error } = await supabase
    .from('businesses')
    .update({
      name: String(formData.get('name') ?? ''),
      tagline: String(formData.get('tagline') ?? '') || null,
      description: String(formData.get('description') ?? '') || null,
      email: String(formData.get('email') ?? '') || null,
      phone: String(formData.get('phone') ?? '') || null,
      website: String(formData.get('website') ?? '') || null,
      address_line1: String(formData.get('address_line1') ?? '') || null,
      price_level: priceLevelRaw ? Number(priceLevelRaw) : null,
    })
    .eq('id', businessId)

  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/listings/${businessId}`)
}

export async function submitForReview(businessId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').update({ status: 'pending_review' }).eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/listings/${businessId}`)
  revalidatePath('/dashboard/listings')
}

export async function archiveListing(businessId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').update({ status: 'archived' }).eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidatePath(`/dashboard/listings/${businessId}`)
  revalidatePath('/dashboard/listings')
}

export async function updateHours(businessId: string, formData: FormData) {
  const supabase = await createClient()

  const rows = Array.from({ length: 7 }, (_, dayOfWeek) => {
    const open = formData.get(`open_${dayOfWeek}`)
    const close = formData.get(`close_${dayOfWeek}`)
    const toMinutes = (value: FormDataEntryValue | null) => {
      if (!value || typeof value !== 'string' || !value.includes(':')) return null
      const [h, m] = value.split(':').map(Number)
      return h * 60 + m
    }
    return {
      business_id: businessId,
      day_of_week: dayOfWeek,
      open_minute: toMinutes(open),
      close_minute: toMinutes(close),
    }
  })

  const { error } = await supabase.from('business_hours').upsert(rows, { onConflict: 'business_id,day_of_week' })
  if (error) throw new Error(error.message)

  revalidatePath(`/dashboard/listings/${businessId}`)
}
