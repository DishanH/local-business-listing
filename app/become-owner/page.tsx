import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Store } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

import { becomeBusinessOwner } from './actions'

export default async function BecomeOwnerPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login?next=/become-owner')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()

  if (profile?.role === 'business_owner' || profile?.role === 'admin') {
    redirect('/dashboard')
  }

  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-lg items-center px-4 py-16">
      <Card className="w-full">
        <CardHeader className="text-center">
          <span className="mx-auto mb-2 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Store className="size-6" />
          </span>
          <CardTitle className="text-xl">List your business on Localry</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-center">
          <p className="text-sm text-muted-foreground">
            Create a listing, manage hours and menus, reply to customer messages, and respond to
            reviews — all from your business dashboard.
          </p>
          <ul className="space-y-2 text-left text-sm text-muted-foreground">
            <li>• Free draft listings — publish when you&apos;re ready</li>
            <li>• Photos, offerings, hours, and amenities</li>
            <li>• Direct messages from customers</li>
          </ul>
          <form action={becomeBusinessOwner}>
            <Button type="submit" size="lg" className="w-full justify-center">
              Yes, I want to list my business
            </Button>
          </form>
          <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
            Not now — back to browsing
          </Link>
        </CardContent>
      </Card>
    </div>
  )
}
