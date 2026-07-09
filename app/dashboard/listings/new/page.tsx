import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { getTopLevelCategories } from '@/lib/supabase/queries/categories'

import { createListing } from '../actions'

export default async function NewListingPage() {
  const categories = await getTopLevelCategories()

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">New listing</h2>
        <p className="text-sm text-muted-foreground">
          Start with the basics — you can fill in hours, photos, and menu details after.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Business details</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createListing} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="name">Business name</Label>
              <Input id="name" name="name" required placeholder="The Copper Fork" />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="category_id">Category</Label>
              <select
                id="category_id"
                name="category_id"
                required
                defaultValue=""
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
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

            <Button type="submit" size="lg" className="mt-2 w-full justify-center">
              Create draft listing
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
