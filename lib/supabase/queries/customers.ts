import 'server-only'

import { createClient } from '@/lib/supabase/server'

export type CustomerReputation = {
  customerId: string
  fullName: string
  memberSince: string
  /** Ratings received from business owners */
  reputationAvg: number
  reputationCount: number
  /** Reviews this customer has written on businesses */
  reviewsWritten: number
  reviewsAvgGiven: number
  /** Their review on the current business, if any */
  reviewOnThisBusiness: { rating: number; body: string | null; createdAt: string } | null
  /** This owner's existing rating of the customer, if any */
  myRating: { rating: number; body: string | null } | null
}

export async function getCustomerReputation(
  customerId: string,
  businessId: string,
  raterId: string,
): Promise<CustomerReputation | null> {
  const supabase = await createClient()

  const [{ data: profile }, { data: writtenReviews }, { data: thisReview }, { data: myRating }] =
    await Promise.all([
      supabase
        .from('profiles')
        .select('id, full_name, created_at, customer_avg_rating, customer_rating_count')
        .eq('id', customerId)
        .single(),
      supabase.from('reviews').select('rating').eq('author_id', customerId),
      supabase
        .from('reviews')
        .select('rating, body, created_at')
        .eq('author_id', customerId)
        .eq('business_id', businessId)
        .maybeSingle(),
      supabase
        .from('customer_ratings')
        .select('rating, body')
        .eq('customer_id', customerId)
        .eq('rater_id', raterId)
        .maybeSingle(),
    ])

  if (!profile) return null

  const reviews = writtenReviews ?? []
  const reviewsWritten = reviews.length
  const reviewsAvgGiven =
    reviewsWritten > 0
      ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewsWritten) * 10) / 10
      : 0

  return {
    customerId: profile.id,
    fullName: profile.full_name ?? 'Customer',
    memberSince: profile.created_at,
    reputationAvg: profile.customer_avg_rating ?? 0,
    reputationCount: profile.customer_rating_count ?? 0,
    reviewsWritten,
    reviewsAvgGiven,
    reviewOnThisBusiness: thisReview
      ? { rating: thisReview.rating, body: thisReview.body, createdAt: thisReview.created_at }
      : null,
    myRating: myRating ? { rating: myRating.rating, body: myRating.body } : null,
  }
}
