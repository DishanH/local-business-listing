import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTopLevelCategories } from '@/lib/supabase/queries/categories'

export const dynamic = 'force-dynamic'

import { createListing } from '../actions'

export default async function NewListingPage() {
  const categories = await getTopLevelCategories()

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-sm">
            <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
              Overview
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-semibold">New listing</span>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Start with the basics — hours, photos, and menu come next.
          </p>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
        <form action={createListing} className="mx-auto grid max-w-3xl gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label htmlFor="name">Business name</Label>
            <Input id="name" name="name" required placeholder="The Copper Fork" className="h-10" />
          </div>

          <div className="flex flex-col gap-1.5 lg:col-span-2">
            <Label htmlFor="category_id">Category</Label>
            <select
              id="category_id"
              name="category_id"
              required
              defaultValue=""
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="" disabled>
                Choose a category
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="lg:col-span-2">
            <Button type="submit" size="lg" className="w-full sm:w-auto">
              Create draft listing
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
