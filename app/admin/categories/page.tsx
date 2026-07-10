import { FolderTree } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CategoryIcon } from '@/components/category-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepCard } from '@/components/ui/step-card'
import { createClient } from '@/lib/supabase/server'

import { createCategory, deleteCategory, updateCategory } from './actions'

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

  return { all, topLevel, childrenByParent, countByCategory }
}

export default async function AdminCategoriesPage() {
  const { all, topLevel, childrenByParent, countByCategory } = await getTaxonomy()

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Categories</h2>
        <p className="text-sm text-muted-foreground">
          {topLevel.length} top-level categories,{' '}
          {[...childrenByParent.values()].reduce((n, list) => n + list.length, 0)} subcategories. Click a category
          below to edit it or manage its subcategories.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add top-level category</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createCategory} className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col gap-1.5 lg:col-span-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" required placeholder="Restaurants" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="icon">Icon (lucide name)</Label>
              <Input id="icon" name="icon" placeholder="UtensilsCrossed" />
            </div>
            <div className="flex items-end">
              <Button type="submit" className="w-full">
                Add category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-3">
        {topLevel.map((category) => {
          const subcategories = childrenByParent.get(category.id) ?? []
          const businessCount = countByCategory.get(category.id) ?? 0
          return (
            <StepCard
              key={category.id}
              icon={<CategoryIcon name={category.icon ?? 'Store'} size={19} />}
              title={category.name}
              description={`${subcategories.length} subcategor${subcategories.length === 1 ? 'y' : 'ies'}`}
              status={{
                label: `${businessCount} listing${businessCount === 1 ? '' : 's'}`,
                tone: businessCount > 0 ? 'done' : 'empty',
              }}
            >
              <div className="flex flex-col gap-6">
                <div>
                  <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    Edit category
                  </p>
                  <form action={updateCategory.bind(null, category.id)} className="flex flex-col gap-3">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`name-${category.id}`}>Name</Label>
                        <Input id={`name-${category.id}`} name="name" defaultValue={category.name} required />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`icon-${category.id}`}>Icon (lucide name)</Label>
                        <Input id={`icon-${category.id}`} name="icon" defaultValue={category.icon ?? ''} />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label htmlFor={`sort-${category.id}`}>Sort order</Label>
                        <Input id={`sort-${category.id}`} name="sort_order" type="number" defaultValue={category.sort_order} />
                      </div>
                      <label className="flex items-center gap-1.5 self-end pb-2 text-sm text-muted-foreground">
                        <input type="checkbox" name="is_active" defaultChecked={category.is_active} className="size-4 rounded border border-input" />
                        Active on site
                      </label>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button type="submit" size="sm">
                        Save changes
                      </Button>
                      <Button
                        type="submit"
                        size="sm"
                        variant="destructive"
                        formAction={deleteCategory.bind(null, category.id)}
                        disabled={subcategories.length > 0 || businessCount > 0}
                        title={
                          subcategories.length > 0 || businessCount > 0
                            ? 'Remove subcategories and listings first'
                            : undefined
                        }
                      >
                        Delete category
                      </Button>
                    </div>
                  </form>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    <FolderTree size={13} /> Subcategories
                  </p>
                  <div className="flex flex-col gap-2">
                    {subcategories.map((sub) => (
                      <div key={sub.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
                        <form
                          action={updateCategory.bind(null, sub.id)}
                          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                        >
                          <Input name="name" defaultValue={sub.name} className="min-w-0 flex-1" required />
                          <input type="hidden" name="icon" value={sub.icon ?? ''} />
                          <input type="hidden" name="sort_order" value={sub.sort_order} />
                          <label className="flex items-center gap-1 text-xs text-muted-foreground">
                            <input type="checkbox" name="is_active" defaultChecked={sub.is_active} />
                            On
                          </label>
                          <Badge variant="outline">{countByCategory.get(sub.id) ?? 0}</Badge>
                          <Button type="submit" size="sm" variant="outline">
                            Save
                          </Button>
                          <Button
                            type="submit"
                            size="sm"
                            variant="destructive"
                            formAction={deleteCategory.bind(null, sub.id)}
                          >
                            Delete
                          </Button>
                        </form>
                      </div>
                    ))}
                    {subcategories.length === 0 && (
                      <p className="text-sm text-muted-foreground">No subcategories yet.</p>
                    )}
                  </div>

                  <form
                    action={createCategory}
                    className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3"
                  >
                    <input type="hidden" name="parent_id" value={category.id} />
                    <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
                      <Label htmlFor={`new-sub-${category.id}`}>Add subcategory</Label>
                      <Input id={`new-sub-${category.id}`} name="name" placeholder="e.g. Italian" required />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label htmlFor={`new-sub-icon-${category.id}`}>Icon</Label>
                      <Input id={`new-sub-icon-${category.id}`} name="icon" className="w-32" placeholder="optional" />
                    </div>
                    <Button type="submit" size="sm">
                      Add
                    </Button>
                  </form>
                </div>
              </div>
            </StepCard>
          )
        })}
      </div>

      {all.length === 0 && (
        <p className="text-center text-sm text-muted-foreground">No categories yet. Add one above.</p>
      )}
    </div>
  )
}
