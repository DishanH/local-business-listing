import { Suspense } from 'react'

import { PortalLoginForm } from '@/components/auth/portal-login-form'

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-16">
      <Suspense fallback={null}>
        <PortalLoginForm />
      </Suspense>
    </div>
  )
}
