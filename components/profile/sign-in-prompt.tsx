'use client'

import { useState } from 'react'
import { LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useStore } from '@/components/store-provider'

export function SignInPrompt({ message }: { message: string }) {
  const { signIn } = useStore()
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    signIn(name)
  }

  return (
    <div className="rounded-xl border border-dashed border-border bg-secondary/40 p-4">
      <div className="mb-3 flex items-center gap-2">
        <LogIn className="size-4 text-primary" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">{message}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-2 sm:flex-row">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter your name to sign in"
          className="bg-background"
          aria-label="Your name"
        />
        <Button type="submit" size="sm" className="shrink-0">
          Sign in
        </Button>
      </form>
    </div>
  )
}
