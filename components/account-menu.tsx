'use client'

import { useEffect, useRef, useState } from 'react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStore } from '@/components/store-provider'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { GoogleIcon } from '@/components/icons/google-icon'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AccountMenu() {
  const { user, signOut } = useStore()
  const [open, setOpen] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  if (!user) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 rounded-full pl-3"
          onClick={() => setDialogOpen(true)}
        >
          <User className="size-4" aria-hidden="true" />
          Sign in
        </Button>
        <SignInDialog open={dialogOpen} onOpenChange={setDialogOpen} />
      </>
    )
  }

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen((v) => !v)}
        className="rounded-full"
        aria-label="Account menu"
        aria-expanded={open}
      >
        <Avatar className="size-7">
          <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
      </Button>

      {open ? (
        <div className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-64 rounded-2xl border border-border bg-popover p-4 shadow-lg">
          <div className="flex items-center gap-3">
            <Avatar className="size-10">
              <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
                {initials(user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-popover-foreground">{user.name}</p>
              {user.email ? (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              ) : (
                <p className="text-xs text-muted-foreground">Signed in</p>
              )}
            </div>
          </div>

          {user.provider === 'google' ? (
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-secondary-foreground">
              <GoogleIcon className="size-3" /> Connected with Google
            </span>
          ) : null}

          <div className="mt-3 h-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            className="mt-3 w-full"
            onClick={() => {
              signOut()
              setOpen(false)
            }}
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </Button>
        </div>
      ) : null}
    </div>
  )
}
