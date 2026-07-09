'use client'

import { useId, useState } from 'react'
import { Compass, Loader2 } from 'lucide-react'
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
import { createClient } from '@/lib/supabase/client'

interface SignInDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  description?: string
}

type Mode = 'sign-in' | 'sign-up'

export function SignInDialog({ open, onOpenChange, description }: SignInDialogProps) {
  const emailId = useId()
  const passwordId = useId()
  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [loadingGoogle, setLoadingGoogle] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  function reset() {
    setEmail('')
    setPassword('')
    setError(null)
    setNotice(null)
    setMode('sign-in')
  }

  async function handleGoogle() {
    setError(null)
    setLoadingGoogle(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (error) {
      setError(error.message)
      setLoadingGoogle(false)
    }
    // On success the browser navigates away to Google, so no further
    // state updates are needed here.
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setLoading(true)
    const supabase = createClient()

    if (mode === 'sign-in') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      setLoading(false)
      if (error) {
        setError(error.message)
        return
      }
      onOpenChange(false)
      reset()
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }

    if (data.session) {
      onOpenChange(false)
      reset()
      return
    }

    setNotice('Check your inbox to confirm your email, then sign in.')
    setMode('sign-in')
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        onOpenChange(next)
        if (!next) reset()
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
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <GoogleIcon className="size-4" />
            )}
            {loadingGoogle ? 'Redirecting…' : 'Continue with Google'}
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5 text-left">
              <Label htmlFor={emailId}>Email</Label>
              <Input
                id={emailId}
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="h-11 rounded-xl bg-background text-sm"
              />
            </div>
            <div className="flex flex-col gap-1.5 text-left">
              <Label htmlFor={passwordId}>Password</Label>
              <Input
                id={passwordId}
                type="password"
                required
                minLength={6}
                autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="h-11 rounded-xl bg-background text-sm"
              />
            </div>

            {error && <p className="text-left text-sm text-destructive">{error}</p>}
            {notice && <p className="text-left text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}

            <Button type="submit" size="lg" className="h-11 w-full rounded-xl" disabled={loading}>
              {loading && <Loader2 className="size-4 animate-spin" />}
              {mode === 'sign-in' ? 'Sign in' : 'Create account'}
            </Button>
          </form>

          <button
            type="button"
            className="text-center text-sm text-muted-foreground hover:text-foreground"
            onClick={() => {
              setError(null)
              setNotice(null)
              setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')
            }}
          >
            {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
