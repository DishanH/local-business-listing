'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { BusinessCard } from '@/components/business-card'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'
import { useStore } from '@/components/store-provider'

export default function FavoritesPage() {
  const { user, authLoading, favorites, favoritesLoading, businesses } = useStore()
  const saved = businesses.filter((b) => favorites.includes(b.id))

  if (authLoading || (user && favoritesLoading)) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-muted-foreground sm:px-6">Loading favorites…</div>
    )
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex items-center gap-2">
          <Heart size={22} className="text-[color:var(--destructive)]" fill="currentColor" />
          <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Your favorites</h1>
        </div>
        <div className="mt-8">
          <SignInPrompt message="Sign in to save favorites and access them from any device." />
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <div className="flex items-center gap-2">
        <Heart size={22} className="text-[color:var(--destructive)]" fill="currentColor" />
        <h1 className="font-serif text-3xl tracking-tight sm:text-4xl">Your favorites</h1>
      </div>
      <p className="mt-1 text-muted-foreground">
        {saved.length} saved {saved.length === 1 ? 'place' : 'places'}.
      </p>

      {saved.length > 0 ? (
        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((b) => (
            <BusinessCard key={b.id} business={b} />
          ))}
        </div>
      ) : (
        <div className="mt-10 flex flex-col items-center rounded-2xl border border-dashed bg-card/50 py-16 text-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-accent text-primary">
            <Heart size={24} />
          </div>
          <h3 className="mt-4 font-serif text-xl">No favorites yet</h3>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">
            Tap the heart on any real listing to save it here. Demo listings are not saved to your account.
          </p>
          <Link
            href="/search"
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
          >
            Discover businesses
          </Link>
        </div>
      )}
    </div>
  )
}
