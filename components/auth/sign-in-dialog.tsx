'use client'

import { useId, useState } from 'react'
import { Compass, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { GoogleIcon } from '@/components/icons/google-icon'
import { useStore } from '@/components/store-provider'

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description?: string
}

export function SignInDialog({ open, onOpenChange, description }: SignInDialogProps) {
  const { signIn, signInWithGoogle } = useStore()
  const [name, setName] = useState('')
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const nameId = useId()

  function handleGoogle() {
    setLoadingGoogle(true)
    window.setTimeout(() => {
      signInWithGoogle()
      setLoadingGoogle(false)
      onOpenChange(false)
    }, 550)
  }

  function handleNameSignIn(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    signIn(name)
    setName('')
    onOpenChange(false)
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) setName('')
      }}
    >
      <DialogContent>
        <DialogHeader>
          <span className="mb-1 flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
            <Compass size={22} />
          </span>
          <DialogTitle>Welcome to Localry</DialogTitle>
          <DialogDescription>
            {description ?? 'Sign in to save favorites, write reviews, and message businesses directly.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 flex flex-col gap-4">
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="h-11 w-full justify-center gap-2.5 rounded-xl border-border text-sm font-medium"
            onClick={handleGoogle}
            disabled={loadingGoogle}
          >
            {loadingGoogle ? (
              <span className="size-4 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-foreground" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            {loadingGoogle ? 'Connecting…' : 'Continue with Google'}
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleNameSignIn} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <Label htmlFor={nameId}>Continue with your name</Label>
              <Input
                id={nameId}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="h-11 rounded-xl bg-background text-sm"
                autoComplete="name"
              />
            </div>
            <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={!name.trim()}>
              Continue
            </Button>
          </form>

          <p className="flex items-start gap-1.5 text-pretty text-xs text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            This is a demo — sign-in is simulated locally and no real Google account or password
            is required.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
