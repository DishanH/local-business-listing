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

export async function createCategory(formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  const parentId = String(formData.get('parent_id') ?? '') || null
  const icon = String(formData.get('icon') ?? '') || null
  if (!name) throw new Error('Name is required')

  const base = slugify(name) || `category-${Date.now()}`
  let slug = base
  for (let i = 0; i < 5; i += 1) {
    const { data } = await supabase.from('categories').select('id').eq('slug', slug).maybeSingle()
    if (!data) break
    slug = `${base}-${Math.random().toString(36).slice(2, 5)}`
  }

  const { error } = await supabase.from('categories').insert({
    name,
    slug,
    parent_id: parentId,
    icon,
    sort_order: Number(formData.get('sort_order') ?? 0) || 0,
  })
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function updateCategory(categoryId: string, formData: FormData) {
  const supabase = await createClient()
  const name = String(formData.get('name') ?? '').trim()
  if (!name) throw new Error('Name is required')

  const { error } = await supabase
    .from('categories')
    .update({
      name,
      icon: String(formData.get('icon') ?? '') || null,
      sort_order: Number(formData.get('sort_order') ?? 0) || 0,
      is_active: formData.get('is_active') === 'on',
    })
    .eq('id', categoryId)

  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}

export async function deleteCategory(categoryId: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('categories').delete().eq('id', categoryId)
  if (error) throw new Error(error.message)
  revalidatePath('/admin/categories')
}
