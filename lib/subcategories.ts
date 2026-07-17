import type { Business } from './types'

export interface Subcategory {
  id: string
  label: string
  keywords: string[]
}

export const subcategoriesByCategory: Record<string, Subcategory[]> = {
  restaurants: [
    { id: 'italian', label: 'Italian', keywords: ['italian', 'pasta', 'pizza', 'trattoria'] },
    { id: 'american', label: 'American', keywords: ['american', 'bistro', 'burger', 'diner', 'comfort'] },
    { id: 'plant-based', label: 'Plant-based', keywords: ['vegetarian', 'vegan', 'plant', 'veggie'] },
    { id: 'asian', label: 'Asian', keywords: ['asian', 'thai', 'vietnamese', 'southeast'] },
  ],
  cafe: [
    { id: 'coffee', label: 'Coffee & espresso', keywords: ['coffee', 'espresso', 'latte', 'roasters', 'pour-over'] },
    { id: 'breakfast', label: 'Breakfast & brunch', keywords: ['breakfast', 'brunch', 'pancakes', 'toast'] },
    { id: 'pastries', label: 'Pastries', keywords: ['pastry', 'croissant', 'bakery'] },
  ],
  bakery: [
    { id: 'bread', label: 'Bread & loaves', keywords: ['bread', 'sourdough', 'loaf', 'bakehouse'] },
    { id: 'pastries', label: 'Pastries', keywords: ['pastry', 'croissant', 'patisserie', 'macaron'] },
    { id: 'cakes', label: 'Cakes & custom', keywords: ['cake', 'celebration', 'custom'] },
  ],
  salon: [
    { id: 'hair', label: 'Hair & color', keywords: ['hair', 'salon', 'color', 'balayage', 'cut'] },
    { id: 'barber', label: 'Barbershop', keywords: ['barber', 'barbershop', 'shave', 'fade'] },
  ],
  bookstore: [
    { id: 'new', label: 'New releases', keywords: ['bookshop', 'fiction', 'poetry', 'staff picks'] },
    { id: 'used', label: 'Used & rare', keywords: ['used', 'rare', 'trade'] },
    { id: 'travel', label: 'Travel & maps', keywords: ['travel', 'maps', 'guides'] },
  ],
  gym: [
    { id: 'strength', label: 'Strength', keywords: ['strength', 'weights', 'powerlifting', 'barbell'] },
    { id: 'classes', label: 'Group classes', keywords: ['class', 'cycle', 'spin', 'coaching'] },
  ],
  florist: [
    { id: 'everyday', label: 'Everyday bouquets', keywords: ['bouquet', 'arrangement', 'seasonal', 'wildflower'] },
    { id: 'events', label: 'Events & weddings', keywords: ['wedding', 'event', 'florals'] },
  ],
  yoga: [
    { id: 'yoga', label: 'Yoga & movement', keywords: ['yoga', 'vinyasa', 'hatha', 'restorative'] },
    { id: 'wellness', label: 'Wellness & spa', keywords: ['wellness', 'massage', 'sound bath', 'meditation', 'spa'] },
  ],
  petstore: [
    { id: 'supplies', label: 'Food & supplies', keywords: ['pet store', 'supplies', 'food', 'grooming'] },
    { id: 'outdoor', label: 'Outdoor gear', keywords: ['outdoor', 'harness', 'trail', 'gear'] },
  ],
  autoshop: [
    { id: 'repair', label: 'Repair & service', keywords: ['repair', 'mechanic', 'service', 'european'] },
    { id: 'tires', label: 'Tires & tire change', keywords: ['tire', 'tire change', 'winter tires', 'oil change', 'brakes', 'maintenance', 'mobile'] },
  ],
  'home-services': [
    { id: 'plumbing', label: 'Plumbing', keywords: ['plumbing', 'plumber', 'drain', 'water heater', 'leak'] },
    { id: 'electrical', label: 'Electrical repair', keywords: ['electrician', 'electrical', 'panel', 'wiring', 'ev charger'] },
    { id: 'decks-fences', label: 'Decks & fences', keywords: ['deck', 'fence', 'cedar', 'outdoor'] },
    { id: 'handyman', label: 'Handyman', keywords: ['handyman', 'repair', 'fix'] },
  ],
  'kids-family': [
    { id: 'kids-play', label: 'Play centres & soft play', keywords: ['soft play', 'play centre', 'indoor playground', 'toddlers'] },
    { id: 'kids-parties', label: 'Kids party venues', keywords: ['kids party', 'birthday', 'party venue'] },
    { id: 'kids-classes', label: 'Kids classes & camps', keywords: ['kids class', 'camp', 'workshop'] },
    { id: 'kids-care', label: 'Babysitting & nanny', keywords: ['babysitting', 'nanny', 'childcare'] },
  ],
  'pottery-crafts': [
    { id: 'pottery-studio', label: 'Pottery studio', keywords: ['pottery', 'ceramics', 'studio', 'kiln'] },
    { id: 'pottery-classes', label: 'Classes & workshops', keywords: ['pottery class', 'wheel', 'workshop'] },
    { id: 'custom-pottery', label: 'Custom & commissions', keywords: ['custom', 'commission', 'mug'] },
  ],
  'events-party': [
    { id: 'birthday-parties', label: 'Birthday parties', keywords: ['birthday', 'party', 'theme', 'celebration'] },
    { id: 'catering', label: 'Catering', keywords: ['catering', 'caterer'] },
    { id: 'party-rentals', label: 'Party rentals', keywords: ['rental', 'bounce', 'tables'] },
  ],
  'tech-electronics': [
    { id: 'electronics-repair', label: 'Electronics repair', keywords: ['electronics repair', 'phone repair', 'screen', 'laptop', 'gadget'] },
    { id: 'computer-repair', label: 'Computer repair', keywords: ['computer', 'pc', 'mac'] },
    { id: 'phone-repair', label: 'Phone repair', keywords: ['iphone', 'android', 'screen'] },
  ],
}

export function matchesSubcategory(business: Business, sub: Subcategory): boolean {
  const haystack = [business.name, business.tagline, business.description, ...business.keywords]
    .join(' ')
    .toLowerCase()
  return sub.keywords.some((kw) => haystack.includes(kw))
}

export function getSubcategories(categoryId: string): Subcategory[] {
  return subcategoriesByCategory[categoryId] ?? []
}
