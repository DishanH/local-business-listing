'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { businesses, seedReviews } from '@/lib/data'
import { originAreaLabel } from '@/lib/location'
import { createClient } from '@/lib/supabase/client'
import type { UserRole } from '@/lib/supabase/database.types'
import type { Category, City, Message, Review } from '@/lib/types'

interface Rating {
  avg: number
  count: number
}

export interface AppUser {
  id: string
  name: string
  email: string | null
  avatarUrl: string | null
  role: UserRole
}

interface StoreValue {
  // auth (backed by Supabase Auth — see components/auth/sign-in-dialog.tsx)
  user: AppUser | null
  authLoading: boolean
  signOut: () => Promise<void>

  // taxonomy (seeded via supabase/seed.sql, falls back to bundled mock data)
  categories: Category[]
  cities: City[]

  // favorites
  favorites: string[]
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void

  // reviews
  reviews: Review[]
  getReviews: (businessId: string) => Review[]
  getRating: (businessId: string) => Rating
  addReview: (r: Omit<Review, 'id' | 'date'>) => void

  // personal notes
  getNote: (businessId: string) => string
  setNote: (businessId: string, note: string) => void

  // messaging
  getThread: (businessId: string) => Message[]
  sendMessage: (businessId: string, text: string) => void
  unreadCount: number

  // location (map-picked coordinates)
  origin: { lat: number; lng: number }
  originLabel: string
  setOrigin: (lat: number, lng: number) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({
  children,
  initialCategories,
  initialCities,
}: {
  children: ReactNode
  initialCategories: Category[]
  initialCities: City[]
}) {
  const supabase = useMemo(() => createClient(), [])

  const [user, setUser] = useState<AppUser | null>(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [favorites, setFavorites] = useState<string[]>(['daybreak-coffee', 'chapter-and-verse'])
  const [reviews, setReviews] = useState<Review[]>(seedReviews)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [threads, setThreads] = useState<Record<string, Message[]>>({})
  const [origin, setOriginState] = useState({
    lat: initialCities[0]?.lat ?? 40.0,
    lng: initialCities[0]?.lng ?? -74.0,
  })

  useEffect(() => {
    let active = true

    async function hydrateUser(authUser: { id: string; email?: string | null } | null) {
      if (!authUser) {
        if (active) setUser(null)
        return
      }
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, avatar_url, role')
        .eq('id', authUser.id)
        .single()
      if (!active) return
      setUser({
        id: authUser.id,
        name: profile?.full_name || authUser.email?.split('@')[0] || 'Account',
        email: authUser.email ?? null,
        avatarUrl: profile?.avatar_url ?? null,
        role: profile?.role ?? 'customer',
      })
    }

    supabase.auth.getUser().then(({ data }) => {
      hydrateUser(data.user)
      if (active) setAuthLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      hydrateUser(session?.user ?? null)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [supabase])

  const setOrigin = useCallback((lat: number, lng: number) => {
    setOriginState({ lat, lng })
  }, [])

  const originLabel = useMemo(() => originAreaLabel(origin.lat, origin.lng), [origin])

  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
  }, [supabase])

  const isFavorite = useCallback((id: string) => favorites.includes(id), [favorites])

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => (prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]))
  }, [])

  const getReviews = useCallback(
    (businessId: string) =>
      reviews
        .filter((r) => r.businessId === businessId)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [reviews],
  )

  const getRating = useCallback(
    (businessId: string): Rating => {
      const list = reviews.filter((r) => r.businessId === businessId)
      if (!list.length) return { avg: 0, count: 0 }
      const sum = list.reduce((acc, r) => acc + r.rating, 0)
      return { avg: sum / list.length, count: list.length }
    },
    [reviews],
  )

  const addReview = useCallback((r: Omit<Review, 'id' | 'date'>) => {
    const review: Review = {
      ...r,
      id: `r-${Date.now()}`,
      date: new Date().toISOString().slice(0, 10),
    }
    setReviews((prev) => [review, ...prev])
  }, [])

  const getNote = useCallback((businessId: string) => notes[businessId] ?? '', [notes])

  const setNote = useCallback((businessId: string, note: string) => {
    setNotes((prev) => ({ ...prev, [businessId]: note }))
  }, [])

  const getThread = useCallback((businessId: string) => threads[businessId] ?? [], [threads])

  const sendMessage = useCallback((businessId: string, text: string) => {
    const trimmed = text.trim()
    if (!trimmed) return
    const business = businesses.find((b) => b.id === businessId)
    const userMsg: Message = {
      id: `m-${Date.now()}`,
      businessId,
      from: 'user',
      text: trimmed,
      time: Date.now(),
    }
    setThreads((prev) => ({ ...prev, [businessId]: [...(prev[businessId] ?? []), userMsg] }))

    // Simulated business reply.
    window.setTimeout(() => {
      const reply: Message = {
        id: `m-${Date.now()}-r`,
        businessId,
        from: 'business',
        text: `Thanks for reaching out to ${business?.name ?? 'us'}! We'll get back to you shortly. In the meantime, feel free to stop by during our open hours.`,
        time: Date.now(),
      }
      setThreads((prev) => ({ ...prev, [businessId]: [...(prev[businessId] ?? []), reply] }))
    }, 1200)
  }, [])

  const unreadCount = useMemo(
    () => Object.values(threads).reduce((acc, t) => acc + t.length, 0),
    [threads],
  )

  const value = useMemo<StoreValue>(
    () => ({
      user,
      authLoading,
      signOut,
      categories: initialCategories,
      cities: initialCities,
      favorites,
      isFavorite,
      toggleFavorite,
      reviews,
      getReviews,
      getRating,
      addReview,
      getNote,
      setNote,
      getThread,
      sendMessage,
      unreadCount,
      origin,
      originLabel,
      setOrigin,
    }),
    [
      user,
      authLoading,
      signOut,
      initialCategories,
      initialCities,
      favorites,
      isFavorite,
      toggleFavorite,
      reviews,
      getReviews,
      getRating,
      addReview,
      getNote,
      setNote,
      getThread,
      sendMessage,
      unreadCount,
      origin,
      originLabel,
      setOrigin,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
