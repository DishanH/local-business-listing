'use client'

import { useEffect, useState } from 'react'
import type { Business } from '@/lib/types'
import { getOpenStatus, type OpenStatus } from '@/lib/format'

/**
 * Computes a business's open/closed status on the client only.
 * Returns `null` during SSR and the first client render to avoid
 * hydration mismatches caused by time-dependent output.
 */
export function useOpenStatus(business: Business): OpenStatus | null {
  const [status, setStatus] = useState<OpenStatus | null>(null)

  useEffect(() => {
    setStatus(getOpenStatus(business))
  }, [business])

  return status
}
