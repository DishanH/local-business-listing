'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export async function createFilter(formData: FormData) {
  const supabase = await createClient()
  const label = String(formData.get('label') ?? '').trim()
  const groupName = String(formData.get('group_name') ?? '').trim() || 'Amenities'
  const categoryId = String(formData.get('category_id') ?? '') || null
  const sortOrder = Number(formData.get('sort_order') ?? 0) || 0
  if (!label) throw new Error('Label is required')

  const base = slugify(label) || `filter-${Date.now()}`
  let slug = base
  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.from('filters').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${base}-${Math.random().toString(36).slice(2, 5)}`
  }

  const { error } = await supabase.from('filters').insert({
    slug,
    label,
    group_name: groupName,
    category_id: categoryId,
    sort_order: sortOrder,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/filters')
}

export async function updateFilter(filterId: string, formData: FormData) {
  const supabase = await createClient()
  const label = String(formData.get('label') ?? '').trim()
  const groupName = String(formData.get('group_name') ?? '').trim() || 'Amenities'
  if (!label) throw new Error('Label is required')

  const { error } = await supabase
    .from('filters')
    .update({
      label,
      group_name: groupName,
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
    })
    .eq('id', filterId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/filters')
}

export async function deleteFilter(filterId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('filters').delete().eq('id', filterId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/filters')
}
