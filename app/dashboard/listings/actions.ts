'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { PostType } from '@/lib/supabase/database.types'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function revalidateListing(businessId: string) {
  revalidatePath(`/dashboard/listings/${businessId}`)
}

function publicImageUrl(path: string) {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!base) throw new Error('NEXT_PUBLIC_SUPABASE_URL is not set')
  return `${base}/storage/v1/object/public/business-images/${path}`
}

function storagePathFromPublicUrl(url: string): string | null {
  const marker = '/storage/v1/object/public/business-images/'
  const idx = url.indexOf(marker)
  if (idx === -1) return null
  return url.slice(idx + marker.length)
}

function emptyToNull(value: FormDataEntryValue | null) {
  const s = typeof value === 'string' ? value.trim() : ''
  return s || null
}

function parseOptionalInt(value: FormDataEntryValue | null) {
  const s = typeof value === 'string' ? value.trim() : ''
  if (!s) return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
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
  await supabase.rpc('become_business_owner')

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

  revalidatePath('/dashboard')
  revalidatePath('/dashboard/listings')
  redirect(`/dashboard/listings/${data.id}`)
}

export async function updateListing(businessId: string, formData: FormData) {
  const supabase = await createClient()

  const priceLevelRaw = String(formData.get('price_level') ?? '')
  const cityId = emptyToNull(formData.get('city_id'))

  const rawSlug = String(formData.get('slug') ?? '').trim()
  let slug: string | undefined
  if (rawSlug) {
    const normalized = slugify(rawSlug)
    if (!normalized) throw new Error('Public URL must contain at least one letter or number')
    const { data: existing } = await supabase
      .from('businesses')
      .select('id')
      .eq('slug', normalized)
      .neq('id', businessId)
      .maybeSingle()
    if (existing) throw new Error('That URL is already taken — try a different one')
    slug = normalized
  }

  const { error } = await supabase
    .from('businesses')
    .update({
      name: String(formData.get('name') ?? ''),
      ...(slug ? { slug } : {}),
      tagline: emptyToNull(formData.get('tagline')),
      description: emptyToNull(formData.get('description')),
      email: emptyToNull(formData.get('email')),
      phone: emptyToNull(formData.get('phone')),
      website: emptyToNull(formData.get('website')),
      address_line1: emptyToNull(formData.get('address_line1')),
      address_line2: emptyToNull(formData.get('address_line2')),
      postal_code: emptyToNull(formData.get('postal_code')),
      city_id: cityId,
      price_level: priceLevelRaw ? Number(priceLevelRaw) : null,
    })
    .eq('id', businessId)

  if (error) throw new Error(error.message)

  revalidateListing(businessId)
}

export async function updateOfferingsIntro(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('businesses')
    .update({ menu_intro: emptyToNull(formData.get('menu_intro')) })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function updateSpecialsIntro(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('businesses')
    .update({ specials_intro: emptyToNull(formData.get('specials_intro')) })
    .eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function submitForReview(businessId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').update({ status: 'pending_review' }).eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
  revalidatePath('/dashboard')
  revalidatePath('/dashboard/listings')
}

export async function archiveListing(businessId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').update({ status: 'archived' }).eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
  revalidatePath('/dashboard')
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

  revalidateListing(businessId)
}

export async function uploadBusinessImage(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const file = formData.get('file')
  if (!(file instanceof File) || file.size === 0) throw new Error('Image file is required')

  const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
  const safeExt = ['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext) ? ext : 'jpg'
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`
  const path = `${businessId}/${filename}`

  const { error: uploadError } = await supabase.storage.from('business-images').upload(path, file, {
    contentType: file.type || `image/${safeExt}`,
    upsert: false,
  })
  if (uploadError) throw new Error(uploadError.message)

  const url = publicImageUrl(path)
  const altText = emptyToNull(formData.get('alt_text'))

  const { data: existing } = await supabase
    .from('business_images')
    .select('sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const sortOrder = (existing?.[0]?.sort_order ?? -1) + 1

  const { error: insertError } = await supabase.from('business_images').insert({
    business_id: businessId,
    url,
    alt_text: altText,
    sort_order: sortOrder,
  })
  if (insertError) throw new Error(insertError.message)

  const setAsCover = formData.get('set_as_cover') === 'on' || formData.get('set_as_cover') === 'true'
  if (setAsCover) {
    const { error: coverError } = await supabase
      .from('businesses')
      .update({ cover_image_url: url })
      .eq('id', businessId)
    if (coverError) throw new Error(coverError.message)
  }

  revalidateListing(businessId)
}

export async function setCoverImage(businessId: string, imageUrl: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('businesses').update({ cover_image_url: imageUrl }).eq('id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function deleteBusinessImage(businessId: string, imageId: string) {
  const supabase = await createClient()

  const { data: image, error: fetchError } = await supabase
    .from('business_images')
    .select('*')
    .eq('id', imageId)
    .eq('business_id', businessId)
    .single()
  if (fetchError) throw new Error(fetchError.message)

  const { error: deleteError } = await supabase.from('business_images').delete().eq('id', imageId)
  if (deleteError) throw new Error(deleteError.message)

  const storagePath = storagePathFromPublicUrl(image.url)
  if (storagePath) {
    await supabase.storage.from('business-images').remove([storagePath])
  }

  const { data: business } = await supabase.from('businesses').select('cover_image_url').eq('id', businessId).single()
  if (business?.cover_image_url === image.url) {
    const { data: next } = await supabase
      .from('business_images')
      .select('url')
      .eq('business_id', businessId)
      .order('sort_order')
      .limit(1)
      .maybeSingle()
    await supabase
      .from('businesses')
      .update({ cover_image_url: next?.url ?? null })
      .eq('id', businessId)
  }

  revalidateListing(businessId)
}

export async function addOfferingSection(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Section name is required')

  const { data: existing } = await supabase
    .from('business_offering_sections')
    .select('sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const { error } = await supabase.from('business_offering_sections').insert({
    business_id: businessId,
    name,
    sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
  })
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function renameOfferingSection(businessId: string, sectionId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Section name is required')

  const { error } = await supabase
    .from('business_offering_sections')
    .update({ name })
    .eq('id', sectionId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function deleteOfferingSection(businessId: string, sectionId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('business_offering_sections')
    .delete()
    .eq('id', sectionId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function addOffering(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Offering name is required')

  const sectionId = emptyToNull(formData.get('section_id'))

  let sortQuery = supabase
    .from('business_offerings')
    .select('sort_order')
    .eq('business_id', businessId)
    .order('sort_order', { ascending: false })
    .limit(1)
  sortQuery = sectionId ? sortQuery.eq('section_id', sectionId) : sortQuery.is('section_id', null)
  const { data: existing } = await sortQuery

  const { error } = await supabase.from('business_offerings').insert({
    business_id: businessId,
    section_id: sectionId,
    name,
    description: emptyToNull(formData.get('description')),
    price_label: emptyToNull(formData.get('price_label')),
    price_cents: parseOptionalInt(formData.get('price_cents')),
    tag: emptyToNull(formData.get('tag')),
    is_available: formData.get('is_available') !== 'off',
    sort_order: (existing?.[0]?.sort_order ?? -1) + 1,
  })
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function updateOffering(businessId: string, offeringId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Offering name is required')

  const { error } = await supabase
    .from('business_offerings')
    .update({
      name,
      description: emptyToNull(formData.get('description')),
      price_label: emptyToNull(formData.get('price_label')),
      price_cents: parseOptionalInt(formData.get('price_cents')),
      tag: emptyToNull(formData.get('tag')),
      is_available: formData.get('is_available') === 'on' || formData.get('is_available') === 'true',
    })
    .eq('id', offeringId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function deleteOffering(businessId: string, offeringId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('business_offerings').delete().eq('id', offeringId).eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function updateBusinessFilters(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const filterIds = formData
    .getAll('filter_id')
    .map((v) => String(v))
    .filter(Boolean)

  const { error: deleteError } = await supabase.from('business_filters').delete().eq('business_id', businessId)
  if (deleteError) throw new Error(deleteError.message)

  if (filterIds.length > 0) {
    const { error: insertError } = await supabase.from('business_filters').insert(
      filterIds.map((filter_id) => ({ business_id: businessId, filter_id })),
    )
    if (insertError) throw new Error(insertError.message)
  }

  revalidateListing(businessId)
}

export async function addSpecial(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Special name is required')

  // "day_of_week" checkboxes can be selected multiple times (e.g. Mon + Wed).
  // Leaving all of them unchecked means "any day", stored as a single null row.
  const days = [...new Set(formData.getAll('day_of_week').map((v) => Number(v)).filter((n) => Number.isFinite(n)))]

  const base = {
    business_id: businessId,
    name,
    description: emptyToNull(formData.get('description')),
    price_label: emptyToNull(formData.get('price_label')),
    price_cents: parseOptionalInt(formData.get('price_cents')),
    starts_on: emptyToNull(formData.get('starts_on')),
    ends_on: emptyToNull(formData.get('ends_on')),
  }

  const rows = (days.length > 0 ? days : [null]).map((day_of_week) => ({ ...base, day_of_week }))

  const { error } = await supabase.from('business_specials').insert(rows)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function deleteSpecial(businessId: string, specialId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('business_specials').delete().eq('id', specialId).eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function addPost(businessId: string, formData: FormData) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const type = String(formData.get('type') ?? 'update') as PostType
  if (!title || !body) throw new Error('Title and body are required')
  if (!['offer', 'event', 'update'].includes(type)) throw new Error('Invalid post type')

  const { error } = await supabase.from('business_posts').insert({
    business_id: businessId,
    author_id: user?.id ?? null,
    type,
    title,
    body,
    badge: emptyToNull(formData.get('badge')),
    expires_at: emptyToNull(formData.get('expires_at')),
  })
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function updatePost(businessId: string, postId: string, formData: FormData) {
  const supabase = await createClient()
  const title = String(formData.get('title') ?? '').trim()
  const body = String(formData.get('body') ?? '').trim()
  const type = String(formData.get('type') ?? 'update') as PostType
  if (!title || !body) throw new Error('Title and body are required')
  if (!['offer', 'event', 'update'].includes(type)) throw new Error('Invalid post type')

  const { error } = await supabase
    .from('business_posts')
    .update({
      type,
      title,
      body,
      badge: emptyToNull(formData.get('badge')),
      expires_at: emptyToNull(formData.get('expires_at')),
    })
    .eq('id', postId)
    .eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}

export async function deletePost(businessId: string, postId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('business_posts').delete().eq('id', postId).eq('business_id', businessId)
  if (error) throw new Error(error.message)
  revalidateListing(businessId)
}
