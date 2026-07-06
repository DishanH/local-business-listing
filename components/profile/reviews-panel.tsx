'use client'

import { useState } from 'react'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { StarRating, StarInput } from '@/components/star-rating'
import { useStore } from '@/components/store-provider'
import { SignInPrompt } from '@/components/profile/sign-in-prompt'

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

export function ReviewsPanel({ businessId }: { businessId: string }) {
  const { user, getReviews, getRating, addReview } = useStore()
  const reviews = getReviews(businessId)
  const rating = getRating(businessId)

  const [stars, setStars] = useState(5)
  const [text, setText] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user || !text.trim()) return
    addReview({ businessId, author: user.name, rating: stars, text: text.trim() })
    setText('')
    setStars(5)
  }

  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-5 text-primary" aria-hidden="true" />
          <h2 className="font-serif text-lg font-semibold text-card-foreground">
            Reviews {rating.count > 0 ? `(${rating.count})` : ''}
          </h2>
        </div>
        {rating.count > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold text-card-foreground">{rating.avg.toFixed(1)}</span>
            <StarRating value={rating.avg} size={16} />
          </div>
        ) : null}
      </div>

      {user ? (
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
          <Button type="submit" size="sm" disabled={!text.trim()}>
            Post review
          </Button>
        </form>
      ) : (
        <div className="mb-6">
          <SignInPrompt message="Sign in to write a review and share your experience." />
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">No reviews yet. Be the first to share your experience!</p>
      ) : (
        <ul className="flex flex-col gap-5">
          {reviews.map((r) => (
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
                <p className="text-sm leading-relaxed text-muted-foreground">{r.text}</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
