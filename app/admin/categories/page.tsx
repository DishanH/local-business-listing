import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/server'

async function getTaxonomy() {
  const supabase = await createClient()
  const [{ data: categories, error: catError }, { data: counts, error: countError }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('businesses').select('category_id').eq('status', 'published'),
  ])
  if (catError) throw catError
  if (countError) throw countError

  const countByCategory = new Map<string, number>()
  for (const row of counts ?? []) {
    countByCategory.set(row.category_id, (countByCategory.get(row.category_id) ?? 0) + 1)
  }

  const all = categories ?? []
  const topLevel = all.filter((c) => !c.parent_id)
  const childrenByParent = new Map<string, typeof all>()
  for (const cat of all) {
    if (!cat.parent_id) continue
    const list = childrenByParent.get(cat.parent_id) ?? []
    list.push(cat)
    childrenByParent.set(cat.parent_id, list)
  }

  return { topLevel, childrenByParent, countByCategory }
}

export default async function AdminCategoriesPage() {
  const { topLevel, childrenByParent, countByCategory } = await getTaxonomy()

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
        <p className="text-sm text-muted-foreground">
          {topLevel.length} top-level categories, {[...childrenByParent.values()].reduce((n, list) => n + list.length, 0)} subcategories.
          Edit the taxonomy directly in Supabase (or extend this page with a CRUD form) as your catalogue grows.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {topLevel.map((category) => (
          <Card key={category.id} className="p-4">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h3 className="font-medium">{category.name}</h3>
              <Badge variant="outline">{countByCategory.get(category.id) ?? 0} listings</Badge>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(childrenByParent.get(category.id) ?? []).map((sub) => (
                <Badge key={sub.id} variant="secondary">
                  {sub.name}
                </Badge>
              ))}
              {(childrenByParent.get(category.id) ?? []).length === 0 && (
                <span className="text-sm text-muted-foreground">No subcategories yet.</span>
              )}
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
