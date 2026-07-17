import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getAppCities } from '@/lib/supabase/queries/taxonomy'
import type { Business } from '@/lib/types'

const cityImages: Record<string, string> = {
  riverton: '/businesses/restaurant.png',
  oakdale: '/businesses/florist.png',
  brookside: '/businesses/bookstore.png',
}

// Sample backgrounds so every city — including newly added ones — gets a
// nice image instead of a blank placeholder.
const fallbackImages = [
  '/businesses/cafe.png',
  '/businesses/bakery.png',
  '/businesses/gym.png',
  '/businesses/salon.png',
  '/businesses/yoga.png',
  '/businesses/petstore.png',
  '/businesses/autoshop.png',
]

export async function CitySection({ businesses }: { businesses: Business[] }) {
  const cities = await getAppCities()

  return (
    <section className="mx-auto max-w-[88rem] px-4 py-14 sm:px-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Explore by city</h2>
        <p className="mt-1 text-muted-foreground">Browse everything happening in each town.</p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
        {cities.map((city, i) => {
          const count = businesses.filter((b) => b.city === city.id).length
          const image = cityImages[city.id] || fallbackImages[i % fallbackImages.length]
          return (
            <Link
              key={city.id}
              href={`/search?city=${city.id}`}
              className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-2xl border p-3.5"
            >
              <Image
                src={image}
                alt={city.name}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/25 to-transparent" />
              <div className="relative text-background">
                <h3 className="font-serif text-lg leading-tight">{city.name}</h3>
                <p className="mt-0.5 inline-flex items-center gap-1 text-xs text-background/90">
                  {count} {count === 1 ? 'listing' : 'listings'}
                  <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
