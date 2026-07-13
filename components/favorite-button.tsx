'use client'

import { useState } from 'react'
import { Heart } from 'lucide-react'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'

interface FavoriteButtonProps {
  businessId: string
  /** Supabase UUID when known — skips a slug lookup on save. */
  dbId?: string | null
  className?: string
  size?: number
  /** solid pill style vs. plain icon */
  variant?: 'pill' | 'plain'
}

export function FavoriteButton({
  businessId,
  dbId,
  className,
  size = 18,
  variant = 'pill',
}: FavoriteButtonProps) {
  const { user, isFavorite, toggleFavorite, businesses } = useStore()
  const [signInOpen, setSignInOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const active = isFavorite(businessId)
  const fromStore = businesses.find((b) => b.id === businessId)
  const resolvedDbId = dbId ?? fromStore?.dbId
  const isDemo = !resolvedDbId && fromStore && !fromStore.isLive

  return (
    <>
      <button
        type="button"
        aria-pressed={active}
        aria-label={active ? 'Remove from favorites' : 'Add to favorites'}
        disabled={pending}
        title={error ?? (isDemo ? 'Demo listings are not saved to your account' : undefined)}
        onClick={async (e) => {
          e.preventDefault()
          e.stopPropagation()
          setError(null)

          if (!user) {
            setSignInOpen(true)
            return
          }

          setPending(true)
          try {
            await toggleFavorite(businessId, resolvedDbId)
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Could not update favorite'
            if (message === 'DEMO_LISTING') {
              setError('Demo listings cannot be saved — try a real listing from the dashboard.')
            } else {
              setError(message)
            }
          } finally {
            setPending(false)
          }
        }}
        className={cn(
          'inline-flex items-center justify-center rounded-full transition-colors',
          variant === 'pill' &&
            'size-9 bg-background/85 text-foreground backdrop-blur-sm shadow-sm hover:bg-background',
          variant === 'plain' && 'text-muted-foreground hover:text-foreground',
          pending && 'opacity-60',
          className,
        )}
      >
        <Heart
          size={size}
          className={cn('transition-colors', active && 'text-[color:var(--destructive)]')}
          fill={active ? 'currentColor' : 'none'}
        />
      </button>
      <SignInDialog
        open={signInOpen}
        onOpenChange={setSignInOpen}
        description="Sign in to save favorites across devices."
      />
    </>
  )
}
