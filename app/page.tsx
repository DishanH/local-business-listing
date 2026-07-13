import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { NearestSection } from '@/components/home/nearest-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { ListBusinessCta } from '@/components/home/list-business-cta'
import { getMixedBusinessesForApp } from '@/lib/supabase/queries/businesses'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'

export default async function HomePage() {
  const businesses = await getMixedBusinessesForApp(200)
  const categories = await getAppCategories()

  return (
    <>
      <Hero />
      <CategoryGrid businesses={businesses} categories={categories} />
      <NearestSection />
      <FeaturedSection />
      <ListBusinessCta />
    </>
  )
}
