import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/components/store-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { MobileNav } from '@/components/mobile-nav'
import { HideOnPortal } from '@/components/hide-on-portal'
import { Toaster } from '@/components/ui/sonner'
import { getAppCategories, getAppCities } from '@/lib/supabase/queries/taxonomy'
import { getMixedBusinessesForApp } from '@/lib/supabase/queries/businesses'
import './globals.css'

// ISR: Revalidate layout data every 15 minutes
export const revalidate = 900

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Localry — Discover great local businesses',
  description:
    'Find, favorite, and connect with the best local businesses near you. Browse by category, city, or distance with smart search.',
  generator: 'v0.app',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light dark',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#0f766e' },
    { media: '(prefers-color-scheme: dark)', color: '#0b1a17' },
  ],
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const [categories, cities, businesses] = await Promise.all([
    getAppCategories(),
    getAppCities(),
    getMixedBusinessesForApp(200),
  ])

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`bg-background ${jakarta.variable} ${fraunces.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <StoreProvider initialCategories={categories} initialCities={cities} initialBusinesses={businesses}>
            <div className="flex min-h-dvh flex-col">
              <SiteHeader />
              <main className="flex-1 pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0">{children}</main>
              <HideOnPortal>
                <SiteFooter />
                <MobileNav />
              </HideOnPortal>
            </div>
            <Toaster />
          </StoreProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
