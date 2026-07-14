import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Pagination, parsePageParam } from '@/components/ui/pagination'
import { createClient } from '@/lib/supabase/server'
import type { UserRole } from '@/lib/supabase/database.types'

import { toggleUserActive, updateUserRole } from './actions'

const PAGE_SIZE = 15
const ROLE_OPTIONS: UserRole[] = ['customer', 'business_owner', 'admin']

const ROLE_BADGE_VARIANT: Record<UserRole, 'default' | 'secondary' | 'outline'> = {
  admin: 'default',
  business_owner: 'secondary',
  customer: 'outline',
}

async function getUsers(pageParam: string | undefined) {
  const supabase = await createClient()
  const { count, error: countError } = await supabase
    .from('profiles')
    .select('id', { count: 'exact', head: true })
  if (countError) throw countError

  const total = count ?? 0
  const { page, totalPages, from, to } = parsePageParam(pageParam, total, PAGE_SIZE)

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
    .range(from, to)
  if (error) throw error

  return { users: data ?? [], page, totalPages, total }
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const { page: pageParam } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { users, page, totalPages, total } = await getUsers(pageParam)
  const currentUserId = user?.id

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Users</h2>
        <p className="text-xs text-muted-foreground">
          Manage account roles. New sign-ups start as customers until promoted.
        </p>
      </div>

      <Card className="overflow-hidden rounded-xl p-0 shadow-none">
        <table className="w-full text-sm">
          <thead className="border-b bg-muted/50 text-left text-xs text-muted-foreground uppercase">
            <tr>
              <th className="px-4 py-2.5 font-medium">Name</th>
              <th className="px-4 py-2.5 font-medium">Role</th>
              <th className="px-4 py-2.5 font-medium">Status</th>
              <th className="px-4 py-2.5 font-medium">Joined</th>
              <th className="px-4 py-2.5 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((profile) => {
              const isSelf = profile.id === currentUserId
              return (
                <tr key={profile.id}>
                  <td className="px-4 py-2.5 font-medium">
                    {profile.full_name ?? 'Unnamed user'}
                    {isSelf ? <span className="ml-2 text-xs text-muted-foreground">(you)</span> : null}
                  </td>
                  <td className="px-4 py-2.5">
                    <Badge variant={ROLE_BADGE_VARIANT[profile.role]}>{profile.role.replace('_', ' ')}</Badge>
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {profile.is_active ? 'Active' : 'Suspended'}
                  </td>
                  <td className="px-4 py-2.5 text-muted-foreground">
                    {new Date(profile.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2.5">
                    <div className="flex flex-wrap justify-end gap-1.5">
                      {!isSelf &&
                        ROLE_OPTIONS.filter((role) => role !== profile.role).map((role) => (
                          <form key={role} action={updateUserRole.bind(null, profile.id, role)}>
                            <Button type="submit" size="sm" variant="outline">
                              Make {role.replace('_', ' ')}
                            </Button>
                          </form>
                        ))}
                      {!isSelf && (
                        <form action={toggleUserActive.bind(null, profile.id, !profile.is_active)}>
                          <Button type="submit" size="sm" variant={profile.is_active ? 'destructive' : 'outline'}>
                            {profile.is_active ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </form>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
            {users.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                  No users yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        <Pagination
          basePath="/admin/users"
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={PAGE_SIZE}
        />
      </Card>
    </div>
  )
}
