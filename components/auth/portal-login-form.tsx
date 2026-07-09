'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { GoogleIcon } from '@/components/icons/google-icon'
import { createClient } from '@/lib/supabase/client'

type Mode = 'sign-in' | 'sign-up'

export function PortalLoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/dashboard'

  const [mode, setMode] = useState<Mode>('sign-in')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

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
      router.push(next)
      router.refresh()
      return
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    setLoading(false)
    if (error) {
      setError(error.message)
      return
    }

    // If email confirmation is disabled in Supabase Auth settings, signUp
    // already returns a live session — sign the user in immediately instead
    // of asking them to check their inbox.
    if (data.session) {
      router.push(next)
      router.refresh()
      return
    }

    setNotice('Check your inbox to confirm your email, then sign in.')
    setMode('sign-in')
  }

  async function handleGoogle() {
    setError(null)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    })
    if (error) setError(error.message)
  }

  return (
    <div className="flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="text-xl font-semibold tracking-tight">
          {mode === 'sign-in' ? 'Sign in to your portal' : 'Create a portal account'}
        </h1>
        <p className="text-sm text-muted-foreground">
          For business owners and admins managing listings.
        </p>
      </div>

      <Button type="button" variant="outline" size="lg" className="w-full justify-center" onClick={handleGoogle}>
        <GoogleIcon className="size-4" />
        Continue with Google
      </Button>

      <div className="flex items-center gap-3 text-xs text-muted-foreground">
        <div className="h-px flex-1 bg-border" />
        or continue with email
        <div className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            minLength={6}
            autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}
        {notice && <p className="text-sm text-emerald-600 dark:text-emerald-400">{notice}</p>}

        <Button type="submit" size="lg" className="mt-1 w-full justify-center" disabled={loading}>
          {loading && <Loader2 className="size-4 animate-spin" />}
          {mode === 'sign-in' ? 'Sign in' : 'Sign up'}
        </Button>
      </form>

      <button
        type="button"
        className="text-center text-sm text-muted-foreground hover:text-foreground"
        onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}
      >
        {mode === 'sign-in' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
      </button>
    </div>
  )
}
