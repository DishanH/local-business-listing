'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { businesses, cities, seedReviews } from '@/lib/data'
import { originAreaLabel } from '@/lib/location'
import type { Message, Review } from '@/lib/types'

interface Rating {
  avg: number
  count: number
}

export interface User {
  name: string
  email?: string
  provider: 'google' | 'guest'
}

interface StoreValue {
  // auth (simulated for this demo — no real backend is wired up)
  user: User | null
  signIn: (name: string) => void
  signInWithGoogle: () => void
  signOut: () => void

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

// Stand-in identities for the simulated "Continue with Google" flow — this demo
// has no OAuth backend, so we mint a realistic-looking profile client-side.
const demoGoogleProfiles = [
  { name: 'Jordan Avery', email: 'jordan.avery@gmail.com' },
  { name: 'Priya Chandran', email: 'priya.chandran@gmail.com' },
  { name: 'Marcus Bell', email: 'marcus.bell@gmail.com' },
]

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [favorites, setFavorites] = useState<string[]>(['daybreak-coffee', 'chapter-and-verse'])
  const [reviews, setReviews] = useState<Review[]>(seedReviews)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [threads, setThreads] = useState<Record<string, Message[]>>({})
  const [origin, setOriginState] = useState({ lat: cities[0].lat, lng: cities[0].lng })

  const setOrigin = useCallback((lat: number, lng: number) => {
    setOriginState({ lat, lng })
  }, [])

  const originLabel = useMemo(() => originAreaLabel(origin.lat, origin.lng), [origin])

  const signIn = useCallback((name: string) => {
    const trimmed = name.trim()
    setUser({ name: trimmed || 'Guest', provider: 'guest' })
  }, [])

  const signInWithGoogle = useCallback(() => {
    const profile = demoGoogleProfiles[Math.floor(Math.random() * demoGoogleProfiles.length)]
    setUser({ name: profile.name, email: profile.email, provider: 'google' })
  }, [])

  const signOut = useCallback(() => setUser(null), [])

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
      signIn,
      signInWithGoogle,
      signOut,
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
      signIn,
      signInWithGoogle,
      signOut,
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
