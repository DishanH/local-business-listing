import type { DayKey, Business, Category, MenuSection, OwnerPost, WeeklySpecial } from '@/lib/types'
import type { Database } from '@/lib/supabase/database.types'

type DbBusiness = Database['public']['Tables']['businesses']['Row']
type DbHours = Database['public']['Tables']['business_hours']['Row']
type DbOffering = Database['public']['Tables']['business_offerings']['Row']
type DbSection = Database['public']['Tables']['business_offering_sections']['Row']
type DbSpecial = Database['public']['Tables']['business_specials']['Row']
type DbPost = Database['public']['Tables']['business_posts']['Row']
type DbCategory = Database['public']['Tables']['categories']['Row']
type DbCity = Database['public']['Tables']['cities']['Row']

const dayKeys: DayKey[] = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

function formatPrice(cents: number | null, label: string | null): string {
  if (label) return label
  if (cents == null) return ''
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`
}

/**
 * A special selected for multiple days (e.g. Mon + Wed + Fri) is stored as one
 * row per day with identical name/description/price. Group those back into a
 * single card for display instead of repeating the same special N times.
 */
function groupSpecialsByOffer(specials: DbSpecial[]) {
  const groups = new Map<string, { name: string; description: string | null; price_cents: number | null; price_label: string | null; days: number[] }>()
  for (const s of specials) {
    const key = [s.name, s.description, s.price_cents, s.price_label, s.starts_on, s.ends_on].join('|')
    const existing = groups.get(key)
    if (existing) {
      if (s.day_of_week != null) existing.days.push(s.day_of_week)
    } else {
      groups.set(key, {
        name: s.name,
        description: s.description,
        price_cents: s.price_cents,
        price_label: s.price_label,
        days: s.day_of_week != null ? [s.day_of_week] : [],
      })
    }
  }
  return [...groups.values()]
}

function buildHoursRecord(hours: DbHours[]): Business['hours'] {
  return Object.fromEntries(
    dayKeys.map((key, i) => {
      const row = hours.find((h) => h.day_of_week === i)
      return [
        key,
        {
          open: row?.open_minute ?? null,
          close: row?.close_minute ?? null,
        },
      ]
    }),
  ) as Business['hours']
}

/**
 * Map a raw published `businesses` row (as used in list views like search
 * results, home page sections, etc.) into the frontend `Business` shape.
 * Lighter-weight than `mapDbBusinessToApp` since it skips offerings/specials/posts.
 */
export function mapBusinessListRowToApp(
  row: DbBusiness,
  category: DbCategory | null,
  city: DbCity | null,
  hours: DbHours[],
): Business {
  return {
    id: row.slug,
    dbId: row.id,
    name: row.name,
    categoryId: category?.slug ?? '',
    tagline: row.tagline ?? '',
    description: row.description ?? '',
    image: row.cover_image_url || '/placeholder.svg',
    city: city?.slug ?? '',
    address: row.address_line1 ?? '',
    lat: row.lat ?? city?.lat ?? 0,
    lng: row.lng ?? city?.lng ?? 0,
    phone: row.phone ?? '',
    email: row.email ?? '',
    website: row.website ?? '',
    priceLevel: (row.price_level as 1 | 2 | 3 | 4) ?? 2,
    featured: row.is_featured,
    keywords: row.keywords ?? [],
    hours: buildHoursRecord(hours),
    rating: { avg: row.avg_rating, count: row.review_count },
    isLive: true,
  }
}

/** Map a Supabase listing payload into the frontend Business shape used by profile panels. */
export function mapDbBusinessToApp(input: {
  business: DbBusiness
  category: DbCategory | null
  city: DbCity | null
  hours: DbHours[]
  images: { url: string }[]
  offeringSections: (DbSection & { offerings: DbOffering[] })[]
  specials: DbSpecial[]
  posts: DbPost[]
}): { business: Business; category: Category | undefined } {
  const { business: b, category, city, hours, images, offeringSections, specials, posts } = input

  const hoursRecord = buildHoursRecord(hours)

  const menu: MenuSection[] = offeringSections.map((section) => ({
    name: section.name,
    items: section.offerings.map((o) => ({
      name: o.name,
      price: formatPrice(o.price_cents, o.price_label),
      description: o.description ?? undefined,
      tag: o.tag ?? undefined,
    })),
  }))

  const weeklySpecials: WeeklySpecial[] = groupSpecialsByOffer(specials).map((group) => ({
    day: group.days.length
      ? group.days
          .slice()
          .sort((a, b) => a - b)
          .map((d) => dayKeys[d])
          .join(', ')
      : 'any',
    name: group.name,
    price: formatPrice(group.price_cents, group.price_label),
    description: group.description ?? undefined,
  }))

  const ownerPosts: OwnerPost[] = posts.map((p) => ({
    id: p.id,
    date: p.published_at.slice(0, 10),
    type: p.type,
    title: p.title,
    body: p.body,
    badge: p.badge ?? undefined,
  }))

  const cover = b.cover_image_url || images[0]?.url || '/placeholder.svg'

  return {
    business: {
      id: b.slug,
      dbId: b.id,
      name: b.name,
      categoryId: category?.slug ?? '',
      tagline: b.tagline ?? '',
      description: b.description ?? '',
      image: cover,
      city: city?.slug ?? '',
      address: b.address_line1 ?? '',
      lat: b.lat ?? city?.lat ?? 0,
      lng: b.lng ?? city?.lng ?? 0,
      phone: b.phone ?? '',
      email: b.email ?? '',
      website: b.website ?? '',
      priceLevel: (b.price_level as 1 | 2 | 3 | 4) ?? 2,
      featured: b.is_featured,
      keywords: b.keywords ?? [],
      hours: hoursRecord,
      ownerPosts,
      weeklySpecials,
      menu,
      menuIntro: b.menu_intro,
      specialsIntro: b.specials_intro,
      rating: { avg: b.avg_rating, count: b.review_count },
      isLive: true,
    },
    category: category
      ? { id: category.slug, name: category.name, icon: category.icon ?? 'Store' }
      : undefined,
  }
}
