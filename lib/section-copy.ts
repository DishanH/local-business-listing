// Category-aware fallback copy for the public "Menu" / "Specials" sections.
// Used only when the owner hasn't set a custom blurb (businesses.menu_intro /
// specials_intro). Keyed by category slug (see lib/data.ts `categories`).
const FOOD_CATEGORIES = new Set(['restaurants', 'cafe', 'bakery'])

export function defaultMenuIntro(categorySlug?: string): string {
  if (categorySlug && FOOD_CATEGORIES.has(categorySlug)) {
    return "A taste of what's cooking. Menu updates seasonally."
  }
  return 'Products and services offered here.'
}

export function defaultSpecialsIntro(categorySlug?: string): string {
  if (categorySlug && FOOD_CATEGORIES.has(categorySlug)) {
    return "This week's deals and happy hours."
  }
  return 'Current deals and limited-time offers.'
}
