'use client'

import Link from 'next/link'
import { useState } from 'react'
import {
  Search,
  Compass,
  Menu,
  Heart,
  MessageSquare,
  Store,
  ShieldCheck,
  LogOut,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { AccountMenu } from '@/components/account-menu'
import { LocationMenu } from '@/components/location-picker'
import { SearchDialog } from '@/components/search/search-dialog'
import { SignInDialog } from '@/components/auth/sign-in-dialog'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { useHideOnScrollDown } from '@/hooks/use-scroll-direction'
import { useStore } from '@/components/store-provider'
import { cn } from '@/lib/utils'

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

function MobileMenuContent({ onClose }: { onClose: () => void }) {
  const { user, authLoading, signOut } = useStore()
  const [signInOpen, setSignInOpen] = useState(false)

  const linkClass =
    'flex items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-sm font-medium transition-colors hover:bg-muted'

  return (
    <div className="flex flex-col gap-5 overflow-y-auto">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Appearance</span>
        <ThemeToggle />
      </div>

      <div className="h-px bg-border" />

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Account</p>
        {authLoading ? (
          <div className="h-10 animate-pulse rounded-lg bg-muted" />
        ) : user ? (
          <div className="flex flex-col gap-1">
            <p className="px-2.5 pb-1 text-sm font-semibold">{user.name}</p>
            {user.email ? (
              <p className="px-2.5 pb-2 text-xs text-muted-foreground">{user.email}</p>
            ) : null}
            <Link
              href={user.role === 'business_owner' || user.role === 'admin' ? '/dashboard/messages' : '/messages'}
              onClick={onClose}
              className={linkClass}
            >
              <MessageSquare size={16} className="text-muted-foreground" />
              Messages
            </Link>
            <Link href="/favorites" onClick={onClose} className={linkClass}>
              <Heart size={16} className="text-muted-foreground" />
              My favorites
            </Link>
            {user.role === 'business_owner' || user.role === 'admin' ? (
              <Link href="/dashboard" onClick={onClose} className={linkClass}>
                <Store size={16} className="text-muted-foreground" />
                Business dashboard
              </Link>
            ) : (
              <Link href="/become-owner" onClick={onClose} className={linkClass}>
                <Store size={16} className="text-muted-foreground" />
                List your business
              </Link>
            )}
            {user.role === 'admin' ? (
              <Link href="/admin" onClick={onClose} className={linkClass}>
                <ShieldCheck size={16} className="text-muted-foreground" />
                Admin panel
              </Link>
            ) : null}
            <Button
              variant="outline"
              size="sm"
              className="mt-2 w-full"
              onClick={() => {
                signOut()
                onClose()
              }}
            >
              <LogOut size={16} />
              Sign out
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => {
              onClose()
              setSignInOpen(true)
            }}
          >
            <User size={16} />
            Sign in
          </Button>
        )}
      </div>

      <SignInDialog open={signInOpen} onOpenChange={setSignInOpen} />
    </div>
  )
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const scrolledDown = useHideOnScrollDown()
  const hidden = scrolledDown && !menuOpen && !searchOpen

  return (
    <>
      <header
        className={cn(
          'sticky top-0 z-40 border-b bg-background/80 backdrop-blur-md transition-transform duration-300 ease-out',
          hidden && '-translate-y-full',
        )}
      >
        <div className="mx-auto flex h-14 max-w-[88rem] items-center gap-1.5 px-4 sm:h-16 sm:gap-2 sm:px-6">
          <Logo />

          <div className="ml-auto flex min-w-0 items-center gap-0.5 sm:gap-1">
            {/* Mobile: location + search in header */}
            <div className="flex items-center gap-0.5 md:hidden">
              <LocationMenu className="max-w-[7.5rem] sm:max-w-[9.5rem]" />
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 rounded-full"
                aria-label="Search businesses"
                onClick={() => setSearchOpen(true)}
              >
                <Search size={18} />
              </Button>
            </div>

            {/* Desktop: full header controls */}
            <div className="hidden items-center gap-0.5 md:flex md:gap-1">
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

              <span className="mx-0.5 h-6 w-px bg-border" aria-hidden="true" />

              <ThemeToggle />

              <span className="mx-0.5 h-6 w-px bg-border" aria-hidden="true" />

              <AccountMenu />
            </div>

            {/* Mobile: account extras in menu */}
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger
                render={
                  <Button variant="ghost" size="icon" className="shrink-0 rounded-full md:hidden" aria-label="Open menu" />
                }
              >
                <Menu size={18} />
              </SheetTrigger>
              <SheetContent side="right" className="w-[min(100vw-2rem,20rem)]">
                <SheetHeader>
                  <SheetTitle>Menu</SheetTitle>
                </SheetHeader>
                <MobileMenuContent onClose={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  )
}
