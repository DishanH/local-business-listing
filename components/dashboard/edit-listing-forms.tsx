'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Building2,
  ChevronDown,
  Clock,
  Images,
  ListChecks,
  Megaphone,
  Pencil,
  Percent,
  Plus,
  SlidersHorizontal,
  Trash2,
  X,
} from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { StepStatus } from '@/components/ui/step-card'
import { Textarea } from '@/components/ui/textarea'
import { ToastForm, runWithToast } from '@/components/toast-form'
import { cn } from '@/lib/utils'
import type { Database } from '@/lib/supabase/database.types'

import {
  addOffering,
  addOfferingSection,
  addPost,
  addSpecial,
  deleteBusinessImage,
  deleteOffering,
  deleteOfferingSection,
  deletePost,
  deleteSpecial,
  renameOfferingSection,
  setCoverImage,
  updateBusinessFilters,
  updateHours,
  updateListing,
  updateOffering,
  updateOfferingsIntro,
  updatePost,
  updateSpecialsIntro,
  uploadBusinessImage,
} from '@/app/dashboard/listings/actions'

type Business = Database['public']['Tables']['businesses']['Row']
type BusinessHour = Database['public']['Tables']['business_hours']['Row']
type BusinessImage = Database['public']['Tables']['business_images']['Row']
type OfferingSection = Database['public']['Tables']['business_offering_sections']['Row']
type Offering = Database['public']['Tables']['business_offerings']['Row']
type Special = Database['public']['Tables']['business_specials']['Row']
type Post = Database['public']['Tables']['business_posts']['Row']
type Filter = Database['public']['Tables']['filters']['Row']
type City = Database['public']['Tables']['cities']['Row']

const DAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function minutesToTime(minutes: number | null): string {
  if (minutes === null) return ''
  const h = Math.floor(minutes / 60)
    .toString()
    .padStart(2, '0')
  const m = (minutes % 60).toString().padStart(2, '0')
  return `${h}:${m}`
}

function hoursFormKey(hoursByDay: Map<number, BusinessHour>) {
  return DAY_LABELS.map((_, dayOfWeek) => {
    const row = hoursByDay.get(dayOfWeek)
    return `${row?.open_minute ?? 'x'}-${row?.close_minute ?? 'x'}`
  }).join('|')
}

function fingerprint(parts: Array<string | number | null | undefined>) {
  return parts.map((p) => (p == null ? 'x' : String(p))).join('|')
}

type DayTimes = { open: string; close: string }

function HoursSection({ businessId, hours }: { businessId: string; hours: BusinessHour[] }) {
  const hoursByDay = new Map(hours.map((row) => [row.day_of_week, row]))
  const initial: DayTimes[] = DAY_LABELS.map((_, dayOfWeek) => {
    const existing = hoursByDay.get(dayOfWeek)
    return {
      open: minutesToTime(existing?.open_minute ?? null),
      close: minutesToTime(existing?.close_minute ?? null),
    }
  })
  const [days, setDays] = useState<DayTimes[]>(initial)
  const saveHours = updateHours.bind(null, businessId)

  function copyMondayToWeekdays() {
    const monday = days[1]
    setDays((prev) =>
      prev.map((day, i) => (i >= 1 && i <= 5 ? { open: monday.open, close: monday.close } : day)),
    )
  }

  function copyMondayToAllDays() {
    const monday = days[1]
    setDays(DAY_LABELS.map(() => ({ open: monday.open, close: monday.close })))
  }

  return (
    <ToastForm action={saveHours} successMessage="Hours saved" className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">Leave both times blank to mark a day closed.</p>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" size="sm" onClick={copyMondayToWeekdays}>
            Copy Mon–Fri
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={copyMondayToAllDays}>
            Copy to all
          </Button>
        </div>
      </div>
      <div className="overflow-hidden rounded-xl border">
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-border text-xs font-medium text-muted-foreground">
          <div className="bg-muted/50 px-3 py-2">Day</div>
          <div className="bg-muted/50 px-3 py-2">Opens</div>
          <div className="bg-muted/50 px-3 py-2">Closes</div>
        </div>
        {DAY_LABELS.map((label, dayOfWeek) => (
          <div key={dayOfWeek} className="grid grid-cols-[1fr_1fr_1fr] gap-px bg-border">
            <div className="flex items-center bg-background px-3 py-2 text-sm">{label}</div>
            <div className="bg-background p-1.5">
              <Input
                type="time"
                name={`open_${dayOfWeek}`}
                value={days[dayOfWeek].open}
                onChange={(e) => {
                  const value = e.target.value
                  setDays((prev) => prev.map((d, i) => (i === dayOfWeek ? { ...d, open: value } : d)))
                }}
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
            <div className="bg-background p-1.5">
              <Input
                type="time"
                name={`close_${dayOfWeek}`}
                value={days[dayOfWeek].close}
                onChange={(e) => {
                  const value = e.target.value
                  setDays((prev) => prev.map((d, i) => (i === dayOfWeek ? { ...d, close: value } : d)))
                }}
                className="border-0 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        ))}
      </div>
      <Button type="submit" className="w-fit">
        Save hours
      </Button>
    </ToastForm>
  )
}

function ImagesSection({
  businessId,
  images,
  coverImageUrl,
}: {
  businessId: string
  images: BusinessImage[]
  coverImageUrl: string | null
}) {
  const upload = uploadBusinessImage.bind(null, businessId)
  const imagesKey = fingerprint(images.flatMap((img) => [img.id, img.url, img.alt_text, img.sort_order]))

  return (
    <div className="flex flex-col gap-6">
      {images.length > 0 && (
        <ul key={imagesKey} className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
          {images.map((image) => {
            const isCover = coverImageUrl === image.url
            return (
              <li key={image.id} className="flex flex-col gap-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={image.alt_text ?? ''}
                  className="aspect-[4/3] w-full rounded-lg object-cover"
                />
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  {isCover ? (
                    <span className="text-muted-foreground">Cover photo</span>
                  ) : (
                    <ToastForm action={setCoverImage.bind(null, businessId, image.url)} successMessage="Cover photo updated">
                      <Button type="submit" variant="outline" size="sm">
                        Set as cover
                      </Button>
                    </ToastForm>
                  )}
                  <ToastForm action={deleteBusinessImage.bind(null, businessId, image.id)} successMessage="Photo deleted">
                    <Button type="submit" variant="destructive" size="sm">
                      Delete
                    </Button>
                  </ToastForm>
                </div>
                {image.alt_text && <p className="text-xs text-muted-foreground">{image.alt_text}</p>}
              </li>
            )
          })}
        </ul>
      )}

      <ToastForm key={`upload-${imagesKey}`} action={upload} successMessage="Photo uploaded" className="flex flex-col gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="image_file">Upload photo</Label>
          <Input id="image_file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/gif" required />
          <p className="text-xs text-muted-foreground">
            Photos are resized and compressed automatically (max ~1600px). Prefer clear, well-lit shots.
          </p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="alt_text">Alt text</Label>
          <Input id="alt_text" name="alt_text" placeholder="Describe the photo" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="set_as_cover" className="size-4 rounded border border-input" />
          Set as cover photo
        </label>
        <Button type="submit" className="w-fit">
          Upload
        </Button>
      </ToastForm>
    </div>
  )
}

function MenuIntroForm({ businessId, menuIntro }: { businessId: string; menuIntro: string | null }) {
  const save = updateOfferingsIntro.bind(null, businessId)
  return (
    <ToastForm
      key={menuIntro ?? ''}
      action={save}
      successMessage="Menu intro saved"
      className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4"
    >
      <Label htmlFor="menu_intro">Intro text shown under &quot;Menu&quot; on your page</Label>
      <Textarea
        id="menu_intro"
        name="menu_intro"
        rows={2}
        defaultValue={menuIntro ?? ''}
        placeholder="Leave blank to use a default line based on your category"
      />
      <Button type="submit" variant="outline" size="sm" className="w-fit">
        Save intro
      </Button>
    </ToastForm>
  )
}

function OfferingRow({ businessId, offering }: { businessId: string; offering: Offering }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <li className="flex items-center justify-between gap-3 px-1 py-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn('size-1.5 shrink-0 rounded-full', offering.is_available ? 'bg-emerald-500' : 'bg-muted-foreground/40')}
            title={offering.is_available ? 'Available' : 'Unavailable'}
          />
          <span className="truncate text-sm font-medium">{offering.name}</span>
          {offering.tag ? (
            <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{offering.tag}</span>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-3">
          {offering.price_label ? <span className="text-sm text-muted-foreground">{offering.price_label}</span> : null}
          <button
            type="button"
            onClick={() => setEditing(true)}
            className="text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Edit ${offering.name}`}
          >
            <Pencil className="size-3.5" />
          </button>
          <ToastForm action={deleteOffering.bind(null, businessId, offering.id)} successMessage="Item deleted">
            <button type="submit" className="text-muted-foreground transition-colors hover:text-destructive" aria-label={`Delete ${offering.name}`}>
              <Trash2 className="size-3.5" />
            </button>
          </ToastForm>
        </div>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <ToastForm
        action={updateOffering.bind(null, businessId, offering.id)}
        successMessage="Item saved"
        className="grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={`offering-name-${offering.id}`}>Name</Label>
          <Input id={`offering-name-${offering.id}`} name="name" defaultValue={offering.name} required />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <Label htmlFor={`offering-desc-${offering.id}`}>Description</Label>
          <Textarea
            id={`offering-desc-${offering.id}`}
            name="description"
            defaultValue={offering.description ?? ''}
            rows={2}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`offering-price-${offering.id}`}>Price label</Label>
          <Input
            id={`offering-price-${offering.id}`}
            name="price_label"
            defaultValue={offering.price_label ?? ''}
            placeholder="$12 or From $50"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`offering-tag-${offering.id}`}>Tag</Label>
          <Input
            id={`offering-tag-${offering.id}`}
            name="tag"
            defaultValue={offering.tag ?? ''}
            placeholder="Popular, New…"
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            name="is_available"
            value="on"
            defaultChecked={offering.is_available}
            className="size-4 rounded border border-input"
          />
          Available
        </label>
        <div className="flex gap-2 sm:col-span-2">
          <Button type="submit" size="sm">
            Save item
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            Cancel
          </Button>
        </div>
      </ToastForm>
    </li>
  )
}

function OfferingSectionCard({
  businessId,
  section,
  sectionOfferings,
  isOpen,
  onToggle,
}: {
  businessId: string
  section: OfferingSection
  sectionOfferings: Offering[]
  isOpen: boolean
  onToggle: () => void
}) {
  const [renaming, setRenaming] = useState(false)

  return (
    <div className="rounded-xl border border-border">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span className="flex items-center gap-2">
          <ChevronDown className={cn('size-4 shrink-0 text-muted-foreground transition-transform', isOpen ? 'rotate-0' : '-rotate-90')} />
          <span className="font-medium">{section.name}</span>
        </span>
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
          {sectionOfferings.length} item{sectionOfferings.length === 1 ? '' : 's'}
        </span>
      </button>

      {isOpen ? (
        <div className="flex flex-col gap-4 border-t border-border p-4">
          {renaming ? (
            <ToastForm
              action={renameOfferingSection.bind(null, businessId, section.id)}
              successMessage="Section renamed"
              className="flex flex-wrap items-end gap-2"
            >
              <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
                <Label htmlFor={`section-name-${section.id}`}>Section name</Label>
                <Input id={`section-name-${section.id}`} name="name" defaultValue={section.name} required />
              </div>
              <Button type="submit" variant="outline" size="sm" onClick={() => setRenaming(false)}>
                Save
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => setRenaming(false)}>
                Cancel
              </Button>
            </ToastForm>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" size="sm" onClick={() => setRenaming(true)}>
                Rename section
              </Button>
              <ToastForm action={deleteOfferingSection.bind(null, businessId, section.id)} successMessage="Section deleted">
                <Button type="submit" variant="destructive" size="sm">
                  Delete section
                </Button>
              </ToastForm>
            </div>
          )}

          {sectionOfferings.length > 0 ? (
            <ul className="flex flex-col divide-y divide-border">
              {sectionOfferings.map((offering) => (
                <OfferingRow key={offering.id} businessId={businessId} offering={offering} />
              ))}
            </ul>
          ) : (
            <p className="text-sm text-muted-foreground">No items in this section yet.</p>
          )}

          <details className="group rounded-lg border border-dashed border-border">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 text-sm font-medium text-muted-foreground group-open:text-foreground">
              <Plus className="size-3.5" />
              Add item to {section.name}
            </summary>
            <ToastForm
              action={addOffering.bind(null, businessId)}
              successMessage="Item added"
              className="grid grid-cols-1 gap-3 border-t border-dashed border-border p-3 sm:grid-cols-2"
            >
              <input type="hidden" name="section_id" value={section.id} />
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor={`add-offering-${section.id}`}>Item name</Label>
                <Input id={`add-offering-${section.id}`} name="name" placeholder="Item name" required />
              </div>
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <Label htmlFor={`add-offering-desc-${section.id}`}>Description</Label>
                <Textarea id={`add-offering-desc-${section.id}`} name="description" rows={2} />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`add-offering-price-${section.id}`}>Price label</Label>
                <Input id={`add-offering-price-${section.id}`} name="price_label" placeholder="$12" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor={`add-offering-tag-${section.id}`}>Tag</Label>
                <Input id={`add-offering-tag-${section.id}`} name="tag" />
              </div>
              <Button type="submit" size="sm" className="w-fit">
                Add item
              </Button>
            </ToastForm>
          </details>
        </div>
      ) : null}
    </div>
  )
}

function OfferingsSection({
  businessId,
  menuIntro,
  sections,
  offerings,
}: {
  businessId: string
  menuIntro: string | null
  sections: OfferingSection[]
  offerings: Offering[]
}) {
  const addSection = addOfferingSection.bind(null, businessId)
  const sectionsKey = fingerprint([
    ...sections.flatMap((s) => [s.id, s.name, s.sort_order]),
    ...offerings.flatMap((o) => [o.id, o.name, o.updated_at, o.section_id, o.price_label, o.tag]),
  ])

  // Only one section open at a time keeps a 20-item menu from turning the page into an endless scroll.
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id ?? null)

  const offeringsBySection = new Map<string, Offering[]>()
  for (const offering of offerings) {
    if (!offering.section_id) continue
    const list = offeringsBySection.get(offering.section_id) ?? []
    list.push(offering)
    offeringsBySection.set(offering.section_id, list)
  }

  return (
    <div className="flex flex-col gap-4">
      <MenuIntroForm businessId={businessId} menuIntro={menuIntro} />

      <div key={sectionsKey} className="flex flex-col gap-3">
        {sections.map((section) => (
          <OfferingSectionCard
            key={section.id}
            businessId={businessId}
            section={section}
            sectionOfferings={offeringsBySection.get(section.id) ?? []}
            isOpen={openSectionId === section.id}
            onToggle={() => setOpenSectionId((current) => (current === section.id ? null : section.id))}
          />
        ))}
      </div>

      <ToastForm action={addSection} successMessage="Section added" className="flex flex-wrap items-end gap-2 border-t border-border pt-4">
        <div className="flex min-w-[12rem] flex-1 flex-col gap-1.5">
          <Label htmlFor="new_section_name">New section</Label>
          <Input id="new_section_name" name="name" placeholder="e.g. Mains, Hair services" required />
        </div>
        <Button type="submit">Add section</Button>
      </ToastForm>
    </div>
  )
}

function FiltersSection({
  businessId,
  filters,
  selectedFilterIds,
}: {
  businessId: string
  filters: Filter[]
  selectedFilterIds: string[]
}) {
  const save = updateBusinessFilters.bind(null, businessId)
  const selected = new Set(selectedFilterIds)
  const key = fingerprint([...selectedFilterIds].sort().concat(filters.map((f) => f.id)))

  const byGroup = new Map<string, Filter[]>()
  for (const filter of filters) {
    const list = byGroup.get(filter.group_name) ?? []
    list.push(filter)
    byGroup.set(filter.group_name, list)
  }

  if (filters.length === 0) {
    return <p className="text-sm text-muted-foreground">No filters available for this category yet.</p>
  }

  return (
    <ToastForm key={key} action={save} successMessage="Amenities saved" className="flex flex-col gap-4">
      {[...byGroup.entries()].map(([group, groupFilters]) => (
        <fieldset key={group} className="flex flex-col gap-2">
          <legend className="text-sm font-medium">{group}</legend>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {groupFilters.map((filter) => (
              <label
                key={filter.id}
                className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm transition-colors hover:bg-muted/40"
              >
                <input
                  type="checkbox"
                  name="filter_id"
                  value={filter.id}
                  defaultChecked={selected.has(filter.id)}
                  className="size-4 rounded border border-input"
                />
                {filter.label}
              </label>
            ))}
          </div>
        </fieldset>
      ))}
      <Button type="submit" className="w-fit">
        Save filters
      </Button>
    </ToastForm>
  )
}

const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function SpecialsIntroForm({ businessId, specialsIntro }: { businessId: string; specialsIntro: string | null }) {
  const save = updateSpecialsIntro.bind(null, businessId)
  return (
    <ToastForm
      key={specialsIntro ?? ''}
      action={save}
      successMessage="Specials intro saved"
      className="flex flex-col gap-2 rounded-xl border border-border bg-muted/30 p-4"
    >
      <Label htmlFor="specials_intro">Intro text shown under &quot;Specials&quot; on your page</Label>
      <Textarea
        id="specials_intro"
        name="specials_intro"
        rows={2}
        defaultValue={specialsIntro ?? ''}
        placeholder="Leave blank to use a default line based on your category"
      />
      <Button type="submit" variant="outline" size="sm" className="w-fit">
        Save intro
      </Button>
    </ToastForm>
  )
}

/** Groups specials that share name/description/price so "select multiple days" shows as one card, not N. */
function groupSpecials(specials: Special[]) {
  const groups = new Map<string, { ids: string[]; days: (number | null)[]; special: Special }>()
  for (const special of specials) {
    const groupKey = fingerprint([special.name, special.description, special.price_label, special.price_cents, special.starts_on, special.ends_on])
    const existing = groups.get(groupKey)
    if (existing) {
      existing.ids.push(special.id)
      existing.days.push(special.day_of_week)
    } else {
      groups.set(groupKey, { ids: [special.id], days: [special.day_of_week], special })
    }
  }
  return [...groups.values()]
}

function AddSpecialForm({ businessId }: { businessId: string }) {
  const add = addSpecial.bind(null, businessId)

  return (
    <ToastForm action={add} successMessage="Special added" className="grid grid-cols-1 gap-3 rounded-xl border border-dashed border-border p-4 sm:grid-cols-2">
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="special_name">Name</Label>
        <Input id="special_name" name="name" required placeholder="Taco Tuesday" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label htmlFor="special_description">Description</Label>
        <Textarea id="special_description" name="description" rows={2} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="special_price">Price label</Label>
        <Input id="special_price" name="price_label" placeholder="$9" />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="special_starts">Starts on</Label>
        <Input id="special_starts" name="starts_on" type="date" />
      </div>
      <div className="flex flex-col gap-1.5 sm:col-span-2">
        <Label>Days (pick any, or leave blank for every day)</Label>
        <div className="flex flex-wrap gap-1.5">
          {DAY_SHORT.map((label, i) => (
            <label key={label} className="cursor-pointer">
              <input type="checkbox" name="day_of_week" value={i} className="peer sr-only" />
              <span
                className={cn(
                  'inline-flex h-8 min-w-9 items-center justify-center rounded-full border border-input bg-background px-2.5 text-xs font-medium text-muted-foreground transition-colors',
                  'hover:bg-muted peer-checked:border-primary peer-checked:bg-primary peer-checked:text-primary-foreground',
                )}
              >
                {label}
              </span>
            </label>
          ))}
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="special_ends">Ends on</Label>
        <Input id="special_ends" name="ends_on" type="date" />
      </div>
      <Button type="submit" className="w-fit">
        Add special
      </Button>
    </ToastForm>
  )
}

function SpecialsSection({
  businessId,
  specialsIntro,
  specials,
}: {
  businessId: string
  specialsIntro: string | null
  specials: Special[]
}) {
  const key = fingerprint(specials.flatMap((s) => [s.id, s.name, s.day_of_week, s.price_label, s.description]))
  const groups = groupSpecials(specials)

  return (
    <div className="flex flex-col gap-4">
      <SpecialsIntroForm businessId={businessId} specialsIntro={specialsIntro} />

      {groups.length > 0 && (
        <ul key={key} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {groups.map((group) => {
            const dayLabels = group.days.every((d) => d == null)
              ? ['Any day']
              : group.days.filter((d): d is number => d != null).sort((a, b) => a - b).map((d) => DAY_SHORT[d])
            return (
              <li key={group.ids.join(',')} className="flex flex-col gap-2 rounded-xl border border-border p-3">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium">{group.special.name}</p>
                  <button
                    type="button"
                    onClick={() => {
                      void runWithToast(
                        () => Promise.all(group.ids.map((id) => deleteSpecial(businessId, id))).then(() => undefined),
                        'Special deleted',
                      )
                    }}
                    className="text-muted-foreground transition-colors hover:text-destructive"
                    aria-label={`Delete ${group.special.name}`}
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </div>
                {group.special.description && <p className="text-sm text-muted-foreground">{group.special.description}</p>}
                <div className="flex flex-wrap items-center gap-1.5">
                  {dayLabels.map((label) => (
                    <span key={label} className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground">
                      {label}
                    </span>
                  ))}
                  {group.special.price_label ? (
                    <span className="text-xs font-semibold text-card-foreground">{group.special.price_label}</span>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <AddSpecialForm businessId={businessId} />
    </div>
  )
}

function PostFields({ post }: { post?: Post }) {
  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`post_type_${post?.id ?? 'new'}`}>Type</Label>
          <select
            id={`post_type_${post?.id ?? 'new'}`}
            name="type"
            defaultValue={post?.type ?? 'update'}
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="update">Update</option>
            <option value="offer">Offer</option>
            <option value="event">Event</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor={`post_badge_${post?.id ?? 'new'}`}>Badge</Label>
          <Input id={`post_badge_${post?.id ?? 'new'}`} name="badge" defaultValue={post?.badge ?? ''} placeholder="20% off" />
        </div>
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`post_title_${post?.id ?? 'new'}`}>Title</Label>
        <Input id={`post_title_${post?.id ?? 'new'}`} name="title" defaultValue={post?.title ?? ''} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`post_body_${post?.id ?? 'new'}`}>Body</Label>
        <Textarea id={`post_body_${post?.id ?? 'new'}`} name="body" rows={3} defaultValue={post?.body ?? ''} required />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor={`post_expires_${post?.id ?? 'new'}`}>Expires at</Label>
        <Input
          id={`post_expires_${post?.id ?? 'new'}`}
          name="expires_at"
          type="datetime-local"
          defaultValue={post?.expires_at ? post.expires_at.slice(0, 16) : ''}
        />
      </div>
    </>
  )
}

const POST_TYPE_LABEL: Record<string, string> = { offer: 'Offer', event: 'Event', update: 'Update' }

function PostRow({ businessId, post }: { businessId: string; post: Post }) {
  const [editing, setEditing] = useState(false)

  if (!editing) {
    return (
      <li className="flex flex-wrap items-start justify-between gap-3 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{POST_TYPE_LABEL[post.type] ?? post.type}</p>
          <p className="font-medium">
            {post.title}
            {post.badge ? ` · ${post.badge}` : ''}
          </p>
          <p className="text-sm text-muted-foreground">{post.body}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Pencil className="size-3.5" />
            Edit
          </Button>
          <ToastForm action={deletePost.bind(null, businessId, post.id)} successMessage="Post deleted">
            <Button type="submit" variant="destructive" size="sm">
              Delete
            </Button>
          </ToastForm>
        </div>
      </li>
    )
  }

  return (
    <li className="flex flex-col gap-3 rounded-lg border border-border bg-muted/20 p-3">
      <ToastForm action={updatePost.bind(null, businessId, post.id)} successMessage="Post saved" className="flex flex-col gap-3">
        <PostFields post={post} />
        <div className="flex gap-2">
          <Button type="submit" size="sm">
            Save post
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setEditing(false)}>
            <X className="size-3.5" />
            Cancel
          </Button>
        </div>
      </ToastForm>
    </li>
  )
}

function PostsSection({ businessId, posts }: { businessId: string; posts: Post[] }) {
  const add = addPost.bind(null, businessId)
  const key = fingerprint(posts.flatMap((p) => [p.id, p.title, p.type, p.updated_at, p.badge]))

  return (
    <div className="flex flex-col gap-6">
      {posts.length > 0 && (
        <ul key={key} className="flex flex-col gap-3">
          {posts.map((post) => (
            <PostRow key={post.id} businessId={businessId} post={post} />
          ))}
        </ul>
      )}

      <details className="group rounded-xl border border-dashed border-border" open={posts.length === 0}>
        <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-medium text-muted-foreground group-open:text-foreground">
          <Plus className="size-3.5" />
          New post
        </summary>
        <ToastForm action={add} successMessage="Post added" className="flex flex-col gap-3 border-t border-dashed border-border p-4">
          <PostFields />
          <Button type="submit" className="w-fit">
            Add post
          </Button>
        </ToastForm>
      </details>
    </div>
  )
}

function DetailsSection({ business, cities }: { business: Business; cities: City[] }) {
  const updateDetails = updateListing.bind(null, business.id)
  const detailsKey = fingerprint([
    business.updated_at,
    business.name,
    business.slug,
    business.tagline,
    business.description,
    business.phone,
    business.email,
    business.website,
    business.address_line1,
    business.address_line2,
    business.postal_code,
    business.city_id,
    business.price_level,
  ])

  return (
    <ToastForm key={detailsKey} action={updateDetails} successMessage="Details saved" className="flex flex-col gap-6">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="name">Business name</Label>
            <Input id="name" name="name" defaultValue={business.name} required />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="tagline">Tagline</Label>
            <Input id="tagline" name="tagline" defaultValue={business.tagline ?? ''} placeholder="A short one-liner" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={business.description ?? ''} rows={6} />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="slug">Public URL</Label>
            <div className="flex items-stretch gap-2">
              <span className="flex items-center rounded-lg border border-input bg-muted px-3 text-sm text-muted-foreground">
                /business/
              </span>
              <Input id="slug" name="slug" defaultValue={business.slug} className="flex-1" required />
            </div>
            <p className="text-xs text-muted-foreground">Changing this breaks existing shared links.</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" defaultValue={business.phone ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" defaultValue={business.email ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={business.website ?? ''} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="price_level">Price level</Label>
              <select
                id="price_level"
                name="price_level"
                defaultValue={business.price_level?.toString() ?? ''}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Not set</option>
                <option value="1">$</option>
                <option value="2">$$</option>
                <option value="3">$$$</option>
                <option value="4">$$$$</option>
              </select>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_line1">Address</Label>
            <Input id="address_line1" name="address_line1" defaultValue={business.address_line1 ?? ''} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="address_line2">Address line 2</Label>
            <Input id="address_line2" name="address_line2" defaultValue={business.address_line2 ?? ''} />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="city_id">City</Label>
              <select
                id="city_id"
                name="city_id"
                defaultValue={business.city_id ?? ''}
                className="h-9 rounded-lg border border-input bg-background px-3 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="">Not set</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>
                    {city.name}
                    {city.region ? `, ${city.region}` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="postal_code">Postal code</Label>
              <Input id="postal_code" name="postal_code" defaultValue={business.postal_code ?? ''} />
            </div>
          </div>
        </div>
      </div>
      <Button type="submit" className="w-fit">
        Save changes
      </Button>
    </ToastForm>
  )
}

export function EditListingForms({
  business,
  hours,
  images,
  sections,
  offerings,
  specials,
  posts,
  selectedFilterIds,
  availableFilters,
  cities,
}: {
  business: Business
  hours: BusinessHour[]
  images: BusinessImage[]
  sections: OfferingSection[]
  offerings: Offering[]
  specials: Special[]
  posts: Post[]
  selectedFilterIds: string[]
  availableFilters: Filter[]
  cities: City[]
}) {
  const detailsComplete = Boolean(
    business.description && business.phone && business.address_line1 && business.city_id,
  )
  const detailsStatus: StepStatus = detailsComplete
    ? { label: 'Complete', tone: 'done' }
    : { label: 'Add more info', tone: 'pending' }

  const daysSet = hours.filter((h) => h.open_minute != null && h.close_minute != null).length
  const hoursStatus: StepStatus =
    daysSet === 7
      ? { label: 'All 7 days set', tone: 'done' }
      : daysSet > 0
        ? { label: `${daysSet}/7 days set`, tone: 'pending' }
        : { label: 'Not set', tone: 'empty' }

  const photosStatus: StepStatus =
    images.length > 0
      ? { label: `${images.length} photo${images.length === 1 ? '' : 's'}`, tone: 'done' }
      : { label: 'No photos yet', tone: 'empty' }

  const offeringsStatus: StepStatus =
    offerings.length > 0
      ? { label: `${offerings.length} item${offerings.length === 1 ? '' : 's'}`, tone: 'done' }
      : { label: 'No items yet', tone: 'empty' }

  const filtersStatus: StepStatus =
    availableFilters.length === 0
      ? { label: 'Not available', tone: 'empty' }
      : selectedFilterIds.length > 0
        ? { label: `${selectedFilterIds.length} selected`, tone: 'done' }
        : { label: 'None selected', tone: 'empty' }

  const specialsStatus: StepStatus =
    specials.length > 0 ? { label: `${specials.length} active`, tone: 'done' } : { label: 'None yet', tone: 'empty' }

  const postsStatus: StepStatus =
    posts.length > 0
      ? { label: `${posts.length} post${posts.length === 1 ? '' : 's'}`, tone: 'done' }
      : { label: 'None yet', tone: 'empty' }

  type SectionId = 'details' | 'hours' | 'photos' | 'offerings' | 'filters' | 'specials' | 'posts'

  const navItems: Array<{
    id: SectionId
    title: string
    description: string
    /** Where this shows up on the public business page, so it's obvious what each tab controls. */
    appearsIn: string | null
    icon: typeof Building2
    status: StepStatus
  }> = [
    {
      id: 'details',
      title: 'Business details',
      description: 'Name, contact, address',
      appearsIn: 'Page header & sidebar',
      icon: Building2,
      status: detailsStatus,
    },
    {
      id: 'hours',
      title: 'Hours',
      description: 'When you are open',
      appearsIn: 'Hours',
      icon: Clock,
      status: hoursStatus,
    },
    {
      id: 'photos',
      title: 'Photos',
      description: 'Cover and gallery',
      appearsIn: 'Header photo & gallery',
      icon: Images,
      status: photosStatus,
    },
    {
      id: 'offerings',
      title: 'Offerings / menu',
      description: 'Products and services',
      appearsIn: 'Menu',
      icon: ListChecks,
      status: offeringsStatus,
    },
    {
      id: 'filters',
      title: 'Amenities',
      description: 'Filters customers use',
      appearsIn: 'Amenities',
      icon: SlidersHorizontal,
      status: filtersStatus,
    },
    {
      id: 'specials',
      title: 'Specials',
      description: 'Deals and happy hours',
      appearsIn: 'Specials',
      icon: Percent,
      status: specialsStatus,
    },
    {
      id: 'posts',
      title: 'News & offers',
      description: 'Announcements, offers, and events',
      appearsIn: 'News & offers',
      icon: Megaphone,
      status: postsStatus,
    },
  ]

  const searchParams = useSearchParams()
  const requestedSection = searchParams.get('section') as SectionId | null
  const initialActive =
    requestedSection && navItems.some((item) => item.id === requestedSection)
      ? requestedSection
      : detailsComplete
        ? 'hours'
        : 'details'
  const [active, setActive] = useState<SectionId>(initialActive)
  const activeItem = navItems.find((item) => item.id === active) ?? navItems[0]

  const toneClass =
    activeItem.status.tone === 'done'
      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
      : activeItem.status.tone === 'pending'
        ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
        : 'bg-muted text-muted-foreground'

  return (
    <div className="flex h-full min-h-0">
      {/* Mail-style section nav */}
      <aside className="hidden w-[220px] shrink-0 flex-col border-r lg:flex xl:w-[260px]">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Edit listing</p>
          <p className="text-xs text-muted-foreground">One section at a time</p>
        </div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = item.id === active
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActive(item.id)}
                className={cn(
                  buttonVariants({ variant: isActive ? 'secondary' : 'ghost', size: 'sm' }),
                  'h-auto w-full flex-col items-start gap-0.5 px-3 py-2.5 text-left',
                )}
              >
                <span className="flex w-full items-center gap-2">
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate font-medium">{item.title}</span>
                </span>
                <span className="pl-6 text-xs font-normal text-muted-foreground">{item.status.label}</span>
                {item.appearsIn ? (
                  <span className="pl-6 text-[11px] font-normal text-muted-foreground/70">
                    On your page: {item.appearsIn}
                  </span>
                ) : null}
              </button>
            )
          })}
        </nav>
      </aside>

      {/* Content pane */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <div className="flex shrink-0 flex-col gap-3 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold">{activeItem.title}</h3>
              <span className={cn('inline-flex h-5 items-center rounded-full px-2 text-xs font-medium', toneClass)}>
                {activeItem.status.label}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">{activeItem.description}</p>
            {activeItem.appearsIn ? (
              <p className="mt-0.5 text-xs text-muted-foreground/70">
                Appears on your public page under <span className="font-medium">&quot;{activeItem.appearsIn}&quot;</span>
              </p>
            ) : null}
          </div>

          {/* Mobile section switcher */}
          <div className="flex gap-1 overflow-x-auto lg:hidden">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActive(item.id)}
                  title={item.title}
                  className={cn(
                    buttonVariants({ variant: item.id === active ? 'default' : 'outline', size: 'icon-sm' }),
                    'shrink-0',
                  )}
                >
                  <Icon className="size-3.5" />
                </button>
              )
            })}
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
          {active === 'details' && <DetailsSection business={business} cities={cities} />}
          {active === 'hours' && (
            <HoursSection
              key={hoursFormKey(new Map(hours.map((row) => [row.day_of_week, row])))}
              businessId={business.id}
              hours={hours}
            />
          )}
          {active === 'photos' && (
            <ImagesSection businessId={business.id} images={images} coverImageUrl={business.cover_image_url} />
          )}
          {active === 'offerings' && (
            <OfferingsSection
              businessId={business.id}
              menuIntro={business.menu_intro}
              sections={sections}
              offerings={offerings}
            />
          )}
          {active === 'filters' && (
            <FiltersSection
              businessId={business.id}
              filters={availableFilters}
              selectedFilterIds={selectedFilterIds}
            />
          )}
          {active === 'specials' && (
            <SpecialsSection businessId={business.id} specialsIntro={business.specials_intro} specials={specials} />
          )}
          {active === 'posts' && <PostsSection businessId={business.id} posts={posts} />}
        </div>
      </div>
    </div>
  )
}
