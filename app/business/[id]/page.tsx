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
import { BusinessCard } from '@/components/business-card'
import { Badge } from '@/components/ui/badge'

export function generateStaticParams() {
  return businesses.map((b) => ({ id: b.id }))
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

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  // Prefer live Supabase listings (admin links use slug). Fall back to mock data.
  const dbPayload = await getBusinessBySlug(id).catch(() => null)

  if (dbPayload) {
    const { business: appBusiness, category } = mapDbBusinessToApp(dbPayload)
    const social = await getSocialContext(dbPayload.business.id)

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

        {dbPayload.filters.length > 0 && (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {dbPayload.filters.map((f) => (
              <Badge key={f.id} variant="secondary">
                {f.label}
              </Badge>
            ))}
          </div>
        )}

        <ProfileHeader business={appBusiness} category={category} />

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="flex flex-col gap-6 lg:col-span-2">
            {appBusiness.ownerPosts?.length ? (
              <OwnerUpdatesPanel posts={appBusiness.ownerPosts} businessName={appBusiness.name} />
            ) : null}
            <MenuPanel weeklySpecials={appBusiness.weeklySpecials} menu={appBusiness.menu} />
            <ReviewsPanel
              businessId={dbPayload.business.id}
              reviews={social.reviews}
              isOwner={social.isOwner}
              avgRating={dbPayload.business.avg_rating}
              reviewCount={dbPayload.business.review_count}
            />
          </div>
          <div className="flex flex-col gap-6">
            <NotesPanel businessId={dbPayload.business.id} initialNote={social.note} />
            <MessagePanel
              businessId={dbPayload.business.id}
              businessName={appBusiness.name}
              isOwner={social.isOwner}
              initialMessages={social.messages}
            />
            <ContactPanel business={appBusiness} />
            <HoursPanel business={appBusiness} />
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
          <MenuPanel weeklySpecials={business.weeklySpecials} menu={business.menu} />
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
