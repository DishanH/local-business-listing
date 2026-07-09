import { NextResponse, type NextRequest } from 'next/server'

import { updateSession } from '@/lib/supabase/middleware'

export async function proxy(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request)

  const { pathname } = request.nextUrl
  const requiresAuth = pathname.startsWith('/admin') || pathname.startsWith('/dashboard')

  if (requiresAuth && !user) {
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Fine-grained role checks (admin vs. business_owner) happen in each
  // portal's layout.tsx, which already has a Server Component-friendly
  // Supabase client and can query the `profiles` table directly.
  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
