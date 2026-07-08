'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { Search, Compass, Menu, Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AccountMenu } from '@/components/account-menu'
import { LocationMenu } from '@/components/location-picker'
import { SearchDialog } from '@/components/search/search-dialog'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'

function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2">
      <span className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <Compass size={20} />
      </span>
      <span className="hidden font-serif text-xl font-semibold tracking-tight sm:inline">Localry</span>
    </Link>
  )
}

export function SiteHeader() {
  const pathname = usePathname()
  const { favorites } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const onFavorites = pathname.startsWith('/favorites')

  return (
    <>
      <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-2 px-4 sm:h-16 sm:px-6">
          <Logo />

          <div className="ml-auto flex items-center gap-0.5 sm:gap-1">
            <LocationMenu />

            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              aria-label="Search businesses"
              onClick={() => setSearchOpen(true)}
            >
              <Search size={18} />
            </Button>

            <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

            <ThemeToggle />

            <Button
              render={<Link href="/favorites" aria-label={`Favorites (${favorites.length})`} />}
              nativeButton={false}
              variant={onFavorites ? 'secondary' : 'ghost'}
              size="icon"
              className="relative rounded-full sm:size-8"
            >
              <Heart size={18} className={onFavorites ? 'text-[color:var(--destructive)]' : undefined} />
              {favorites.length > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {favorites.length}
                </span>
              )}
            </Button>

            <span className="mx-0.5 hidden h-6 w-px bg-border sm:block" aria-hidden="true" />

            <AccountMenu />

            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="rounded-full sm:hidden" aria-label="Open menu" />
                }
              >
                <Menu size={18} />
              </SheetTrigger>
              <SheetContent side="right">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>

                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    setSearchOpen(true)
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border bg-secondary/40 px-3 py-2.5 text-left text-sm text-muted-foreground transition-colors hover:bg-secondary"
                >
                  <Search size={16} />
                  Search businesses...
                </button>

                <Link
                  href="/favorites"
                  onClick={() => setMenuOpen(false)}
                  aria-current={onFavorites ? 'page' : undefined}
                  className={cn(
                    'inline-flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
                    onFavorites ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                  )}
                >
                  <span className="inline-flex items-center gap-2">
                    <Heart size={16} />
                    Favorites
                  </span>
                  {favorites.length > 0 && (
                    <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                      {favorites.length}
                    </span>
                  )}
                </Link>

                <div className="h-px bg-border" />

                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Appearance
                  </span>
                  <ThemeToggle />
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
