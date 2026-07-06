'use client'

import { useEffect, useRef, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStore } from '@/components/store-provider'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AccountMenu() {
  const { user, signIn, signOut } = useStore()
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSignIn(e: React.FormEvent) {
    e.preventDefault()
    signIn(name)
    setName('')
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant={user ? 'ghost' : 'outline'}
        size={user ? 'icon' : 'sm'}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full"
        aria-label={user ? 'Account menu' : 'Sign in'}
        aria-expanded={open}
      >
        {user ? (
          <Avatar className="size-7">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <>
            <User className="size-4" aria-hidden="true" />
            Sign in
          </>
        )}
      </Button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-xl border border-border bg-popover p-4 shadow-lg">
          {user ? (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <Avatar className="size-9">
                  <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                    {initials(user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-popover-foreground">{user.name}</p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  signOut()
                  setOpen(false)
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSignIn} className="flex flex-col gap-3">
              <div>
                <p className="text-sm font-semibold text-popover-foreground">Welcome back</p>
                <p className="text-xs text-muted-foreground">Sign in to review, save notes, and message businesses.</p>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="bg-background"
                aria-label="Your name"
                autoFocus
              />
              <Button type="submit" size="sm">
                Sign in
              </Button>
            </form>
          )}
        </div>
      ) : null}
    </div>
  )
}
