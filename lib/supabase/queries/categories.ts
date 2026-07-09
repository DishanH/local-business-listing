import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type Category = Database['public']['Tables']['categories']['Row']

export async function getTopLevelCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .is('parent_id', null)
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function getSubcategories(parentId: string): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('parent_id', parentId)
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

/** All categories in one call, useful for building a slug -> node lookup client-side. */
export async function getAllCategories(): Promise<Category[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_active', true)
    .order('sort_order')
  if (error) throw error
  return data ?? []
}

export async function getFiltersForCategory(categoryId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('filters')
    .select('*')
    .or(`category_id.eq.${categoryId},category_id.is.null`)
    .order('group_name')
    .order('sort_order')
  if (error) throw error
  return data ?? []
}
