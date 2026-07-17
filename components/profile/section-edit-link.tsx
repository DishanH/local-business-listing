import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Owner-only "Edit" affordance shown on populated public sections. Opens the dashboard in a new tab so the owner keeps their place on the live page. */
export function SectionEditLink({ href, label = 'Edit' }: { href: string; label?: string }) {
  return (
    <Link href={href} target="_blank" rel="noopener noreferrer" className="ml-auto">
      <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground">
        <Pencil className="size-3.5" aria-hidden="true" />
        {label}
      </Button>
    </Link>
  )
}
