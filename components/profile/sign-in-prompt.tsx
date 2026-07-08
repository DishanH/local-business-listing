'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SignInDialog } from '@/components/auth/sign-in-dialog'

export function SignInPrompt({ message }: { message: string }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border bg-secondary/40 px-4 py-6 text-center sm:flex-row sm:justify-between sm:text-left">
      <div className="flex flex-col items-center gap-2 sm:flex-row sm:items-center">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <LogIn className="size-4" aria-hidden="true" />
        </span>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      <Button size="sm" className="shrink-0 rounded-full px-4" onClick={() => setOpen(true)}>
        Sign in
      </Button>
      <SignInDialog open={open} onOpenChange={setOpen} description={message} />
    </div>
  )
}
