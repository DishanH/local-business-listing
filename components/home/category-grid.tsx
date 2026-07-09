import Link from 'next/link'
import { CategoryIcon } from '@/components/category-icon'
import { businesses } from '@/lib/data'
import { getAppCategories } from '@/lib/supabase/queries/taxonomy'

export async function CategoryGrid() {
  const categories = await getAppCategories()

  return (
    <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl tracking-tight sm:text-3xl">Browse by category</h2>
          <p className="mt-1 text-muted-foreground">Find exactly what you&apos;re looking for.</p>
        </div>
        <Link href="/search" className="hidden shrink-0 text-sm font-medium text-primary hover:underline sm:block">
          View all
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {categories.map((c) => {
          const count = businesses.filter((b) => b.categoryId === c.id).length
          return (
            <Link
              key={c.id}
              href={`/search?category=${c.id}`}
              className="group flex flex-col items-start gap-3 rounded-2xl border bg-card p-5 transition-all hover:-translate-y-1 hover:border-primary hover:shadow-md"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-accent text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <CategoryIcon name={c.icon} size={22} />
              </span>
              <span>
                <span className="block font-medium">{c.name}</span>
                <span className="text-sm text-muted-foreground">{count} places</span>
              </span>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
