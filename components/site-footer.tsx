import Link from 'next/link'
import { Compass } from 'lucide-react'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'

export async function SiteFooter() {
  const categories = await getAppCategories()

  return (
    <footer className="mt-16 border-t bg-secondary/30">
      <div className="mx-auto max-w-[88rem] px-4 py-12 sm:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Compass size={20} />
              </span>
              <span className="font-serif text-xl font-semibold">Localry</span>
            </div>
            <p className="mt-3 max-w-sm text-sm text-muted-foreground text-pretty">
              Discover, favorite, and connect with the best independent businesses in your neighborhood.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {categories.slice(0, 5).map((c) => (
                <li key={c.id}>
                  <Link href={`/search?category=${c.id}`} className="transition-colors hover:text-foreground">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link href="/" className="transition-colors hover:text-foreground">Home</Link></li>
              <li><Link href="/search" className="transition-colors hover:text-foreground">Browse all</Link></li>
              <li><Link href="/favorites" className="transition-colors hover:text-foreground">Favorites</Link></li>
              <li><Link href="/become-owner" className="transition-colors hover:text-foreground">List your business</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t pt-6 text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Localry. A demo local business directory.
        </div>
      </div>
    </footer>
  )
}
