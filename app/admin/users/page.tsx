import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/database.types'

import { toggleUserActive, updateUserRole } from './actions'

const ROLE_OPTIONS: UserRole[] = ['customer', 'business_owner', 'admin']

const ROLE_BADGE_VARIANT: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  business_owner: 'secondary',
  customer: 'outline',
}

async function getUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false })
  if (error) throw error
  return data ?? []
}

export default async function AdminUsersPage() {
  const users = await getUsers()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Users</h2>
        <p className="text-sm text-muted-foreground">
          Manage account roles. New sign-ups start as customers until promoted.
        </p>
      </div>

      <Card className="overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Joined</th>
              <th className="px-4 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((profile) => (
              <tr key={profile.id}>
                <td className="px-4 py-3 font-medium">{profile.full_name ?? 'Unnamed user'}</td>
                <td className="px-4 py-3">
                  <Badge variant={ROLE_BADGE_VARIANT[profile.role]}>{profile.role.replace('_', ' ')}</Badge>
                </td>
                <td className="px-4 py-3 text-muted-foreground">{profile.is_active ? 'Active' : 'Suspended'}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {new Date(profile.created_at).toLocaleDateString()}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-1.5">
                    {ROLE_OPTIONS.filter((role) => role !== profile.role).map((role) => (
                      <form key={role} action={updateUserRole.bind(null, profile.id, role)}>
                        <Button type="submit" size="sm" variant="outline">
                          Make {role.replace('_', ' ')}
                        </Button>
                      </form>
                    ))}
                    <form action={toggleUserActive.bind(null, profile.id, !profile.is_active)}>
                      <Button type="submit" size="sm" variant={profile.is_active ? 'destructive' : 'outline'}>
                        {profile.is_active ? 'Suspend' : 'Reactivate'}
                      </Button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>
    </div>
  )
}
