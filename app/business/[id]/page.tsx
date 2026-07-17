import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { businesses } from '@/lib/data'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'
import { getBusinessBySlug } from '@/lib/supabase/queries/businesses'
import { mapDbBusinessToApp } from '@/lib/supabase/map-business'
import { createClient } from '@/lib/supabase/server'
import { ProfileHeader } from '@/components/profile/profile-header'
import { HoursPanel } from '@/components/profile/hours-panel'
import { ContactPanel } from '@/components/profile/contact-panel'
import { NotesPanel } from '@/components/profile/notes-panel'
import { ReviewsPanel } from '@/components/profile/reviews-panel'
import { MessagePanel } from '@/components/profile/message-panel'
import { OwnerUpdatesPanel } from '@/components/profile/owner-updates-panel'
import { MenuPanel } from '@/components/profile/menu-panel'
import { SpecialsPanel } from '@/components/profile/specials-panel'
import { AmenitiesPanel } from '@/components/profile/amenities-panel'
import { BusinessCard } from '@/components/business-card'
import { Badge } from '@/components/ui/badge'

// ISR: Revalidate business pages every 5 minutes
export const revalidate = 300

export function generateStaticParams() {
  return businesses.map((b) => ({ id: b.id }))
}

// Quick, blocking ownership check so we can decide whether to show owner-only
// "add this" placeholders for empty sections (menu, specials, posts, amenities).
async function getIsOwner(businessUuid: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return false

  const { data } = await supabase
    .from('business_owners')
    .select('business_id')
    .eq('business_id', businessUuid)
    .eq('profile_id', user.id)
    .maybeSingle()

  return Boolean(data)
}

async function getSocialContext(businessUuid: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ data: reviewRows }, noteRes, ownershipRes, conversationRes] = await Promise.all([
    supabase
      .from('reviews')
      .select('id, rating, body, owner_reply, owner_reply_at, created_at, author_id')
      .eq('business_id', businessUuid)
      .order('created_at', { ascending: false }),
    user
      ? supabase.from('notes').select('body').eq('business_id', businessUuid).eq('profile_id', user.id).maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('business_owners')
          .select('business_id')
          .eq('business_id', businessUuid)
          .eq('profile_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user
      ? supabase
          .from('conversations')
          .select('id')
          .eq('business_id', businessUuid)
          .eq('customer_id', user.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const authorIds = [...new Set((reviewRows ?? []).map((r) => r.author_id))]
  const { data: authors } = authorIds.length
    ? await supabase.from('profiles').select('id, full_name').in('id', authorIds)
    : { data: [] }
  const nameById = new Map((authors ?? []).map((a) => [a.id, a.full_name ?? 'Customer']))

  let messages: { id: string; from: 'user' | 'business'; text: string }[] = []
  if (conversationRes.data?.id) {
    const { data: messageRows } = await supabase
      .from('messages')
      .select('id, sender_type, body')
      .eq('conversation_id', conversationRes.data.id)
      .order('created_at')
    messages = (messageRows ?? []).map((m) => ({
      id: m.id,
      from: m.sender_type === 'customer' ? 'user' : 'business',
      text: m.body,
    }))
  }

  return {
    isOwner: Boolean(ownershipRes.data),
    note: noteRes.data?.body ?? '',
    messages,
    reviews: (reviewRows ?? []).map((r) => ({
      id: r.id,
      author: nameById.get(r.author_id) ?? 'Customer',
      authorId: r.author_id,
      rating: r.rating,
      date: r.created_at.slice(0, 10),
      text: r.body ?? '',
      ownerReply: r.owner_reply,
      ownerReplyAt: r.owner_reply_at,
    })),
  }
}

// Server component for reviews with social context
async function ReviewsSection({ businessId, avgRating, reviewCount }: { businessId: string, avgRating: number | null, reviewCount: number }) {
  const social = await getSocialContext(businessId)
  return (
    <ReviewsPanel
      businessId={businessId}
      reviews={social.reviews}
      isOwner={social.isOwner}
      avgRating={avgRating}
      reviewCount={reviewCount}
    />
  )
}

// Server component for user-specific panels (notes & messages)
async function UserSpecificPanels({ businessId, businessName }: { businessId: string, businessName: string }) {
  const social = await getSocialContext(businessId)
  return (
    <>
      <NotesPanel businessId={businessId} initialNote={social.note} />
      <MessagePanel
        businessId={businessId}
        businessName={businessName}
        isOwner={social.isOwner}
        initialMessages={social.messages}
      />
    </>
  )
}

// Loading skeletons
function ReviewsSkeleton() {
  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="h-6 w-32 animate-pulse rounded bg-muted" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
            <div className="h-4 w-full animate-pulse rounded bg-muted" />
            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  )
}

function UserPanelsSkeleton() {
  return (
    <>
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-20 w-full animate-pulse rounded bg-muted" />
      </div>
      <div className="rounded-2xl border bg-card p-6">
        <div className="h-5 w-32 animate-pulse rounded bg-muted" />
        <div className="mt-3 h-32 w-full animate-pulse rounded bg-muted" />
      </div>
    </>
  )
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Prefer live Supabase listings (admin links use slug). Fall back to mock data.
  const dbPayload = await getBusinessBySlug(id).catch(() => null)

  if (dbPayload) {
    const { business: appBusiness, category } = mapDbBusinessToApp(dbPayload)
    const isOwner = await getIsOwner(dbPayload.business.id)
    const dashboardHref = (section: string) => `/dashboard/listings/${dbPayload.business.id}?section=${section}`
    const amenities = dbPayload.filters.map((f) => ({ id: f.id, label: f.label }))

    return (
      <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
          <Link href="/" className="transition-colors hover:text-foreground">
            Home
          </Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <Link
            href={`/search?category=${category?.id ?? ''}`}
            className="transition-colors hover:text-foreground"
          >
            {category?.name}
          </Link>
          <ChevronRight className="size-4" aria-hidden="true" />
          <span className="text-foreground">{appBusiness.name}</span>
        </nav>

        {dbPayload.business.status !== 'published' && (
          <div className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
            This listing is <Badge variant="outline">{dbPayload.business.status.replace('_', ' ')}</Badge> and may
            only be visible to owners/admins.
          </div>
        )}

        <ProfileHeader
          business={appBusiness}
          category={category}
          isOwner={isOwner}
          detailsHref={dashboardHref('details')}
          photosHref={dashboardHref('photos')}
        />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            <OwnerUpdatesPanel
              posts={appBusiness.ownerPosts ?? []}
              businessName={appBusiness.name}
              isOwner={isOwner}
              manageHref={dashboardHref('posts')}
            />
            <MenuPanel
              menu={appBusiness.menu}
              intro={appBusiness.menuIntro}
              categorySlug={category?.id}
              isOwner={isOwner}
              manageHref={dashboardHref('offerings')}
            />
            <SpecialsPanel
              weeklySpecials={appBusiness.weeklySpecials}
              intro={appBusiness.specialsIntro}
              categorySlug={category?.id}
              isOwner={isOwner}
              manageHref={dashboardHref('specials')}
            />

            {/* Reviews stream in with Suspense */}
            <Suspense fallback={<ReviewsSkeleton />}>
              <ReviewsSection 
                businessId={dbPayload.business.id}
                avgRating={dbPayload.business.avg_rating}
                reviewCount={dbPayload.business.review_count}
              />
            </Suspense>
          </div>
          <div className="flex flex-col gap-6">
            {/* User-specific panels stream in with Suspense */}
            <Suspense fallback={<UserPanelsSkeleton />}>
              <UserSpecificPanels
                businessId={dbPayload.business.id}
                businessName={appBusiness.name}
              />
            </Suspense>

            <AmenitiesPanel amenities={amenities} isOwner={isOwner} manageHref={dashboardHref('filters')} />

            {/* Static panels load immediately */}
            <ContactPanel business={appBusiness} isOwner={isOwner} manageHref={dashboardHref('details')} />
            <HoursPanel business={appBusiness} isOwner={isOwner} manageHref={dashboardHref('hours')} />
          </div>
        </div>
      </div>
    )
  }

  // Mock fallback for demo listings still in lib/data.ts
  const business = businesses.find((b) => b.id === id)
  if (!business) notFound()

  const categories = await getAppCategories()
  const category = categories.find((c) => c.id === business.categoryId)
  const similar = businesses
    .filter((b) => b.categoryId === business.categoryId && b.id !== business.id)
    .slice(0, 3)

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:py-8">
      <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="transition-colors hover:text-foreground">
          Home
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <Link
          href={`/search?category=${business.categoryId}`}
          className="transition-colors hover:text-foreground"
        >
          {category?.name}
        </Link>
        <ChevronRight className="size-4" aria-hidden="true" />
        <span className="text-foreground">{business.name}</span>
      </nav>

      <ProfileHeader business={business} category={category} />

      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {business.ownerPosts?.length ? (
            <OwnerUpdatesPanel posts={business.ownerPosts} businessName={business.name} />
          ) : null}
          <MenuPanel menu={business.menu} />
          <SpecialsPanel weeklySpecials={business.weeklySpecials} />
          <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
            Reviews, notes, and messaging for demo listings are not persisted. Create a real listing from the
            business dashboard to use the database-backed features.
          </p>
        </div>
        <div className="flex flex-col gap-6">
          <ContactPanel business={business} />
          <HoursPanel business={business} />
        </div>
      </div>

      {similar.length > 0 ? (
        <section className="mt-12">
          <h2 className="mb-4 font-serif text-2xl font-bold text-foreground">Similar places nearby</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similar.map((b) => (
              <BusinessCard key={b.id} business={b} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
