'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { MapPin, Search, Heart, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AccountMenu } from '@/components/account-menu'
import { useStore } from '@/components/store-provider'
import { cities } from '@/lib/data'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function SiteHeader() {
  const router = useRouter()
  const { originCityId, setOriginCityId, favorites } = useStore()
  const [q, setQ] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(q.trim() ? `/search?q=${encodeURIComponent(q.trim())}` : '/search')
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Compass size={20} />
          </span>
          <span className="font-serif text-xl font-semibold tracking-tight">Localry</span>
        </Link>

        <form onSubmit={submit} className="ml-2 hidden flex-1 items-center md:flex">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search businesses, e.g. 'coper fork'"
              aria-label="Search businesses"
              className="h-10 w-full rounded-full border bg-secondary/50 pl-9 pr-4 text-sm outline-none transition-colors focus:border-ring focus:bg-background"
            />
          </div>
        </form>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <Button
            render={<Link href="/search" aria-label="Search businesses" />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="rounded-full md:hidden"
          >
            <Search size={18} />
          </Button>

          <div className="hidden items-center gap-1.5 sm:flex">
            <MapPin size={16} className="text-primary" />
            <Select value={originCityId} onValueChange={setOriginCityId}>
              <SelectTrigger className="h-9 w-[130px] rounded-full border-none bg-secondary/60 text-sm shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {cities.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <ThemeToggle />

          <Button
            render={<Link href="/favorites" aria-label={`Favorites (${favorites.length})`} />}
            nativeButton={false}
            variant="ghost"
            size="icon"
            className="relative rounded-full"
          >
            <Heart size={18} />
            {favorites.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                {favorites.length}
              </span>
            )}
          </Button>

          <AccountMenu />
        </div>
      </div>
    </header>
  )
}
