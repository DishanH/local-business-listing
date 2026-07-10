'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

import { createClient } from '@/lib/supabase/server'

export async function becomeBusinessOwner() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login?next=/become-owner')

  const { error } = await supabase.rpc('become_business_owner')
  if (error) throw new Error(error.message)

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
