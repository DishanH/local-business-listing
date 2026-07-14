'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { LogOut, MessageSquare, ShieldCheck, Store, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { useStore } from '@/components/store-provider'
import { SignInDialog } from '@/components/auth/sign-in-dialog'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function AccountMenu() {
  const { user, authLoading, signOut } = useStore()
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

  if (authLoading) {
    return <div className="size-8 shrink-0 rounded-full bg-muted/60" aria-hidden="true" />
  }

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

          <div className="mt-3 flex flex-col gap-1">
            <Link
              href="/messages"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
            >
              <MessageSquare className="size-4 text-muted-foreground" aria-hidden="true" />
              Messages
            </Link>

            <Link
              href="/favorites"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
            >
              <User className="size-4 text-muted-foreground" aria-hidden="true" />
              My favorites
            </Link>

            {user.role === 'business_owner' || user.role === 'admin' ? (
              <Link
                href="/dashboard"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
              >
                <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                Business dashboard
              </Link>
            ) : (
              <Link
                href="/become-owner"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
              >
                <Store className="size-4 text-muted-foreground" aria-hidden="true" />
                List your business
              </Link>
            )}

            {user.role === 'admin' ? (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-medium text-popover-foreground transition-colors hover:bg-muted"
              >
                <ShieldCheck className="size-4 text-muted-foreground" aria-hidden="true" />
                Admin panel
              </Link>
            ) : null}
          </div>

          <div className="mt-2 h-px bg-border" />

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
