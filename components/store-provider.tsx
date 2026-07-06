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
import type { Message, Review } from '@/lib/types'

interface Rating {
  avg: number
  count: number
}

interface StoreValue {
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

  // location
  originCityId: string
  setOriginCityId: (id: string) => void
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>(['daybreak-coffee', 'chapter-and-verse'])
  const [reviews, setReviews] = useState<Review[]>(seedReviews)
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [threads, setThreads] = useState<Record<string, Message[]>>({})
  const [originCityId, setOriginCityId] = useState<string>(cities[0].id)

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
      originCityId,
      setOriginCityId,
    }),
    [
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
      originCityId,
    ],
  )

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
