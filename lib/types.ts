export type DayKey = 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun'

export interface DayHours {
  /** 24h open time in minutes from midnight, or null if closed that day */
  open: number | null
  close: number | null
}

export type OwnerPostType = 'offer' | 'event' | 'update'

export interface OwnerPost {
  id: string
  /** ISO date string (YYYY-MM-DD) */
  date: string
  type: OwnerPostType
  title: string
  body: string
  /** optional short highlight, e.g. "20% off" or "Free" */
  badge?: string
}

export interface MenuItem {
  name: string
  price: string
  description?: string
  /** optional tag such as "Popular", "New", "Vegan" */
  tag?: string
}

export interface MenuSection {
  name: string
  items: MenuItem[]
}

export interface WeeklySpecial {
  day: string
  name: string
  price: string
  description?: string
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
  /** promotions, offers, and announcements posted by the owner */
  ownerPosts?: OwnerPost[]
  /** weekly rotating specials (food businesses) */
  weeklySpecials?: WeeklySpecial[]
  /** full menu grouped into sections (food businesses) */
  menu?: MenuSection[]
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
