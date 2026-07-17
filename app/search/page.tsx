import { Suspense } from 'react'
import { SearchClient } from '@/components/search/search-client'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-[88rem] px-4 py-16 text-muted-foreground sm:px-6">Loading…</div>}>
      <SearchClient />
    </Suspense>
  )
}
