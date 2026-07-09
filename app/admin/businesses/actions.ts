'use server'

import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'
import type { BusinessStatus } from '@/lib/supabase/database.types'

export async function updateBusinessStatus(businessId: string, status: BusinessStatus) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { error } = await supabase.from('businesses').update({ status }).eq('id', businessId)
  if (error) throw new Error(error.message)

  await supabase.from('admin_audit_log').insert({
    actor_id: user.id,
    action: `business.status_changed.${status}`,
    target_table: 'businesses',
    target_id: businessId,
  })

  revalidatePath('/admin/businesses')
  revalidatePath('/admin')
}
