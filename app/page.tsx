import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { NearestSection } from '@/components/home/nearest-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { CitySection } from '@/components/home/city-section'
import { getMixedBusinessesForApp } from '@/lib/supabase/queries/businesses'

export default async function HomePage() {
  const businesses = await getMixedBusinessesForApp(200)

  return (
    <>
      <Hero />
      <CategoryGrid businesses={businesses} />
      <NearestSection />
      <FeaturedSection />
      <CitySection businesses={businesses} />
    </>
  )
}
