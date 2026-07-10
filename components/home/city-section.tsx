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

export async function CitySection({ businesses }: { businesses: Business[] }) {
  const cities = await getAppCities()

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div>
        <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Explore by city</h2>
        <p className="mt-1 text-muted-foreground">Browse everything happening in each town.</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        {cities.map((city) => {
          const count = businesses.filter((b) => b.city === city.id).length
          return (
            <Link
              key={city.id}
              href={`/search?city=${city.id}`}
              className="group relative flex aspect-[3/2] flex-col justify-end overflow-hidden rounded-3xl border p-6"
            >
              <Image
                src={cityImages[city.id] || '/placeholder.svg'}
                alt={city.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
              <div className="relative text-background">
                <h3 className="font-serif text-2xl">{city.name}</h3>
                <p className="mt-1 inline-flex items-center gap-1 text-sm text-background/90">
                  {count} businesses <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
                </p>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
