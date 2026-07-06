import { Hero } from '@/components/home/hero'
import { CategoryGrid } from '@/components/home/category-grid'
import { NearestSection } from '@/components/home/nearest-section'
import { FeaturedSection } from '@/components/home/featured-section'
import { CitySection } from '@/components/home/city-section'

export default function HomePage() {
  return (
    <>
      <Hero />
      <CategoryGrid />
      <NearestSection />
      <FeaturedSection />
      <CitySection />
    </>
  )
}
