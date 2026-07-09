import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { businesses } from '@/lib/data'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'
import { ProfileHeader } from '@/components/profile/profile-header'
import { HoursPanel } from '@/components/profile/hours-panel'
import { ContactPanel } from '@/components/profile/contact-panel'
import { NotesPanel } from '@/components/profile/notes-panel'
import { ReviewsPanel } from '@/components/profile/reviews-panel'
import { MessagePanel } from '@/components/profile/message-panel'
import { OwnerUpdatesPanel } from '@/components/profile/owner-updates-panel'
import { MenuPanel } from '@/components/profile/menu-panel'
import { BusinessCard } from '@/components/business-card'

export function generateStaticParams() {
  return businesses.map((b) => ({ id: b.id }))
}

export default async function BusinessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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
          <ReviewsPanel businessId={business.id} />
        </div>
        <div className="flex flex-col gap-6">
          <NotesPanel businessId={business.id} />
          <MessagePanel business={business} />
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
