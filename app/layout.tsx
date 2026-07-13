import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans, Fraunces } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { StoreProvider } from '@/components/store-provider'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { HideOnPortal } from '@/components/hide-on-portal'
import { getAppCategories, getAppCities } from '@/lib/supabase/queries/taxonomy'
import { getMixedBusinessesForApp } from '@/lib/supabase/queries/businesses'
import './globals.css'

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
              <main className="flex-1">{children}</main>
              <HideOnPortal>
                <SiteFooter />
              </HideOnPortal>
            </div>
          </StoreProvider>
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
