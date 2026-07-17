import { Globe2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { CategoryIcon } from '@/components/category-icon'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { StepCard } from '@/components/ui/step-card'
import { ToastButton, ToastForm } from '@/components/toast-form'
import { AdminPageShell } from '@/components/admin/admin-page-shell'
import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'

import { createFilter, deleteFilter, updateFilter } from './actions'

type Filter = Database['public']['Tables']['filters']['Row']

async function getFiltersData() {
  const supabase = await createClient()
  const [{ data: filters, error: filtersError }, { data: categories, error: categoriesError }] =
    await Promise.all([
      supabase.from('filters').select('*').order('group_name').order('sort_order'),
      supabase.from('categories').select('*').is('parent_id', null).order('sort_order'),
    ])
  if (filtersError) throw filtersError
  if (categoriesError) throw categoriesError

  const globalFilters = (filters ?? []).filter((f) => !f.category_id)
  const byCategory = new Map<string, Filter[]>()
  for (const filter of filters ?? []) {
    if (!filter.category_id) continue
    const list = byCategory.get(filter.category_id) ?? []
    list.push(filter)
    byCategory.set(filter.category_id, list)
  }

  return { globalFilters, byCategory, categories: categories ?? [] }
}

function groupByGroupName(filters: Filter[]) {
  const byGroup = new Map<string, Filter[]>()
  for (const filter of filters) {
    const list = byGroup.get(filter.group_name) ?? []
    list.push(filter)
    byGroup.set(filter.group_name, list)
  }
  return [...byGroup.entries()]
}

function FilterRow({ filter }: { filter: Filter }) {
  return (
    <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border p-2">
      <ToastForm
        action={updateFilter.bind(null, filter.id)}
        successMessage="Filter saved"
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
      >
        <Input name="label" defaultValue={filter.label} className="min-w-[10rem] flex-1" required />
        <Input name="group_name" defaultValue={filter.group_name} className="w-32" placeholder="Group" />
        <Input
          name="sort_order"
          type="number"
          defaultValue={filter.sort_order}
          className="w-16"
          title="Sort order"
        />
        <Button type="submit" size="sm" variant="outline">
          Save
        </Button>
        <ToastButton
          action={deleteFilter.bind(null, filter.id)}
          successMessage="Filter deleted"
          size="sm"
          variant="destructive"
        >
          Delete
        </ToastButton>
      </ToastForm>
    </div>
  )
}

function FilterGroupList({ filters }: { filters: Filter[] }) {
  const groups = groupByGroupName(filters)
  if (groups.length === 0) {
    return <p className="text-sm text-muted-foreground">No filters yet.</p>
  }
  return (
    <div className="flex flex-col gap-4">
      {groups.map(([groupName, groupFilters]) => (
        <div key={groupName} className="flex flex-col gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{groupName}</p>
          <div className="flex flex-col gap-2">
            {groupFilters.map((filter) => (
              <FilterRow key={filter.id} filter={filter} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function AddFilterForm({ categoryId }: { categoryId: string | null }) {
  return (
    <ToastForm
      action={createFilter}
      successMessage="Filter added"
      className="mt-3 flex flex-wrap items-end gap-2 border-t border-border pt-3"
    >
      {categoryId ? <input type="hidden" name="category_id" value={categoryId} /> : null}
      <div className="flex min-w-[10rem] flex-1 flex-col gap-1.5">
        <Label htmlFor={`new-label-${categoryId ?? 'global'}`}>Label</Label>
        <Input id={`new-label-${categoryId ?? 'global'}`} name="label" placeholder="e.g. Free WiFi" required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`new-group-${categoryId ?? 'global'}`}>Group</Label>
        <Input
          id={`new-group-${categoryId ?? 'global'}`}
          name="group_name"
          className="w-32"
          placeholder="Amenities"
        />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`new-sort-${categoryId ?? 'global'}`}>Sort</Label>
        <Input
          id={`new-sort-${categoryId ?? 'global'}`}
          name="sort_order"
          type="number"
          className="w-16"
          placeholder="0"
        />
      </div>
      <Button type="submit" size="sm">
        Add
      </Button>
    </ToastForm>
  )
}

export default async function AdminFiltersPage() {
  const { globalFilters, byCategory, categories } = await getFiltersData()

  return (
    <AdminPageShell
      title="Filters & amenities"
      description="Amenity tags owners pick from on their listing. Global tags show for every category; scoped tags only show for businesses in that category."
    >
      <div className="flex flex-col gap-3">
        <StepCard
          icon={<Globe2 size={19} />}
          title="Global"
          description="Applies to every category"
          status={{ label: `${globalFilters.length} filter${globalFilters.length === 1 ? '' : 's'}`, tone: globalFilters.length > 0 ? 'done' : 'empty' }}
        >
          <div className="flex flex-col gap-4">
            <FilterGroupList filters={globalFilters} />
            <AddFilterForm categoryId={null} />
          </div>
        </StepCard>

        {categories.map((category) => {
          const categoryFilters = byCategory.get(category.id) ?? []
          return (
            <StepCard
              key={category.id}
              icon={<CategoryIcon name={category.icon ?? 'Store'} size={19} />}
              title={category.name}
              description="Only shows for this category"
              status={{
                label: `${categoryFilters.length} filter${categoryFilters.length === 1 ? '' : 's'}`,
                tone: categoryFilters.length > 0 ? 'done' : 'empty',
              }}
            >
              <div className="flex flex-col gap-4">
                <FilterGroupList filters={categoryFilters} />
                <AddFilterForm categoryId={category.id} />
              </div>
            </StepCard>
          )
        })}
      </div>
    </AdminPageShell>
  )
}
