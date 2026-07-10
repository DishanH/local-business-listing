'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/database.types'

export async function updateUserRole(profileId: string, role: UserRole) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (profileId === user.id && role !== 'admin') {
    throw new Error('You cannot demote your own admin account')
  }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', profileId)
  if (error) throw new Error(error.message)

  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    action: `user.role_changed.${role}`,
    target_table: 'profiles',
    target_id: profileId,
  })

  revalidatePath('/admin/users')
}

export async function toggleUserActive(profileId: string, isActive: boolean) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
  if (profileId === user.id) throw new Error('You cannot suspend your own account')

  const { error } = await supabase.from('profiles').update({ is_active: isActive }).eq('id', profileId)
  if (error) throw new Error(error.message)

  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    action: isActive ? 'user.reactivated' : 'user.suspended',
    target_table: 'profiles',
    target_id: profileId,
  })

  revalidatePath('/admin/users')
}
