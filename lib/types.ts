export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  /** 24h open time in minutes from midnight, or null if closed that day */
  open: number | null
  close: number | null
}

export interface Business {
  id: string
  name: string
  categoryId: string
  tagline: string
  description: string
  image: string
  city: string
  address: string
  lat: number
  lng: number
  phone: string
  email: string
  website: string
  priceLevel: 1 | 2 | 3 | 4
  featured: boolean
  /** search aliases / keywords that help fuzzy matching */
  keywords: string[]
  hours: Record<DayKey, DayHours>
}

export interface Review {
  id: string
  businessId: string
  author: string
  rating: number
  date: string
  text: string
}

export interface Message {
  id: string
  businessId: string
  from: 'user' | 'business'
  text: string
  time: number
}

export interface Category {
  id: string
  name: string
  /** lucide-react icon name */
  icon: string
}

export interface City {
  id: string
  name: string
  lat: number
  lng: number
}
