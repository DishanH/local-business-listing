import 'server-only'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

export type Profile = Database['public']['Tables']['profiles']['Row']

/** Returns the signed-in user's profile row, or null when logged out. */
export async function getCurrentProfile(): Promise<Profile | null> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  return data
}

/** Business ids the signed-in user is an owner/manager/staff member of. */
export async function getOwnedBusinessIds(): Promise<string[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase.from('business_owners').select('business_id').eq('profile_id', user.id)
  return (data ?? []).map((row) => row.business_id)
}
