'use client'

import { useState, useTransition } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarRating, StarInput } from '@/components/star-rating'
import { useStore } from '@/components/store-provider'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'
import { addReview, replyToReview } from '@/lib/supabase/actions/social'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export interface ReviewItem {
  id: string
  author: string
  authorId: string
  rating: number
  date: string
  text: string
  ownerReply: string | null
  ownerReplyAt: string | null
}

export function ReviewsPanel({
  businessId,
  reviews,
  isOwner,
  avgRating,
  reviewCount,
}: {
  /** Supabase businesses.id (UUID) */
  businessId: string
  reviews: ReviewItem[]
  isOwner: boolean
  avgRating: number
  reviewCount: number
}) {
  const { user } = useStore()
  const [stars, setStars] = useState(5)
  const [text, setText] = useState('')
  const [pending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({})
  const [localReviews, setLocalReviews] = useState(reviews)

  const alreadyReviewed = user ? localReviews.some((r) => r.authorId === user.id) : false

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !text.trim() || isOwner) return
    setError(null)
    const body = text.trim()
    startTransition(async () => {
      try {
        await addReview(businessId, stars, body)
        setLocalReviews((prev) => [
          {
            id: `temp-${Date.now()}`,
            author: user.name,
            authorId: user.id,
            rating: stars,
            date: new Date().toISOString().slice(0, 10),
            text: body,
            ownerReply: null,
            ownerReplyAt: null,
          },
          ...prev.filter((r) => r.authorId !== user.id),
        ])
        setText('')
        setStars(5)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to post review')
      }
    })
  }

  function handleReply(reviewId: string) {
    const reply = (replyDrafts[reviewId] ?? '').trim()
    if (!reply) return
    startTransition(async () => {
      try {
        await replyToReview(reviewId, businessId, reply)
        setLocalReviews((prev) =>
          prev.map((r) =>
            r.id === reviewId
              ? { ...r, ownerReply: reply, ownerReplyAt: new Date().toISOString() }
              : r,
          ),
        )
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save reply')
      }
    })
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">
            Reviews {reviewCount > 0 ? `(${reviewCount})` : ''}
          </h2>
        </div>
        {reviewCount > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-card-foreground">{avgRating.toFixed(1)}</span>
            <StarRating value={avgRating} size={16} />
          </div>
        ) : null}
      </div>

      {isOwner ? (
        <p className="mb-6 text-sm text-muted-foreground">
          Customers leave reviews here. You can reply to them below — you cannot review your own listing.
        </p>
      ) : user ? (
        alreadyReviewed ? (
          <p className="mb-6 text-sm text-muted-foreground">You&apos;ve already reviewed this place. Thanks!</p>
        ) : (
          <form onSubmit={handleSubmit} className="mb-6 rounded-xl border border-border bg-secondary/50 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold text-card-foreground">
                Reviewing as <span className="text-primary">{user.name}</span>
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Rating:</span>
                <StarInput value={stars} onChange={setStars} size={22} />
              </div>
            </div>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Share your experience..."
              rows={3}
              className="mb-3 resize-none bg-background"
              aria-label="Review text"
            />
            <Button type="submit" size="sm" disabled={!text.trim() || pending}>
              {pending ? 'Posting…' : 'Post review'}
            </Button>
          </form>
        )
      ) : (
        <div className="mb-6">
          <SignInPrompt message="Sign in to write a review and share your experience." />
        </div>
      )}

      {error ? <p className="mb-4 text-sm text-destructive">{error}</p> : null}

      {localReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {localReviews.map((r) => (
            <li key={r.id} className="flex gap-3">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {initials(r.author)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-card-foreground">{r.author}</span>
                  <span className="text-xs text-muted-foreground">{r.date}</span>
                </div>
                <StarRating value={r.rating} size={14} className="my-1" />
                <p className="break-words text-sm leading-relaxed text-muted-foreground">{r.text}</p>

                {r.ownerReply ? (
                  <div className="mt-3 rounded-xl border border-border bg-secondary/40 px-3 py-2">
                    <p className="text-xs font-medium text-card-foreground">Owner reply</p>
                    <p className="mt-1 break-words text-sm text-muted-foreground">{r.ownerReply}</p>
                  </div>
                ) : isOwner ? (
                  <div className="mt-3 flex flex-col gap-2">
                    <Textarea
                      value={replyDrafts[r.id] ?? ''}
                      onChange={(e) => setReplyDrafts((prev) => ({ ...prev, [r.id]: e.target.value }))}
                      placeholder="Write a public reply…"
                      rows={2}
                      className="resize-none bg-background text-sm"
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="w-fit"
                      disabled={!(replyDrafts[r.id] ?? '').trim() || pending}
                      onClick={() => handleReply(r.id)}
                    >
                      Post reply
                    </Button>
                  </div>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
