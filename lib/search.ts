import type { Business, Category } from './types'

/** Levenshtein edit distance between two strings. */
function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length

  const prev = new Array(b.length + 1)
  for (let j = 0; j <= b.length; j++) prev[j] = j

  for (let i = 1; i <= a.length; i++) {
    let prevDiag = prev[0]
    prev[0] = i
    for (let j = 1; j <= b.length; j++) {
      const temp = prev[j]
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      prev[j] = Math.min(prev[j] + 1, prev[j - 1] + 1, prevDiag + cost)
      prevDiag = temp
    }
  }
  return prev[b.length]
}

/** Similarity 0..1 based on edit distance, normalized by the longer string. */
function similarity(a: string, b: string): number {
  if (!a.length && !b.length) return 1
  const dist = levenshtein(a, b)
  return 1 - dist / Math.max(a.length, b.length)
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Score how well a business matches a free-text query.
 * Handles typos and partial names ("coper fork" -> "The Copper Fork").
 * Returns 0..1 (higher = better). Anything below the threshold is dropped.
 */
export function scoreBusiness(business: Business, rawQuery: string, categories: Category[]): number {
  const query = normalize(rawQuery)
  if (!query) return 0

  const queryTokens = query.split(' ').filter(Boolean)
  const categoryName = categories.find((c) => c.id === business.categoryId)?.name ?? ''

  // Build the searchable fields with weights.
  const fields: { text: string; weight: number }[] = [
    { text: normalize(business.name), weight: 1 },
    { text: normalize(business.tagline), weight: 0.55 },
    { text: normalize(categoryName), weight: 0.6 },
    { text: normalize(business.city), weight: 0.5 },
    ...business.keywords.map((k) => ({ text: normalize(k), weight: 0.75 })),
  ]

  let best = 0

  for (const field of fields) {
    // Whole-string checks.
    if (field.text === query) best = Math.max(best, 1 * field.weight)
    if (field.text.includes(query)) best = Math.max(best, 0.92 * field.weight)

    // Whole-string fuzzy similarity (typo tolerance across the field).
    best = Math.max(best, similarity(field.text, query) * field.weight)

    // Token-by-token: every query token should find a close field token.
    const fieldTokens = field.text.split(' ').filter(Boolean)
    if (fieldTokens.length && queryTokens.length) {
      let sum = 0
      for (const qt of queryTokens) {
        let tokenBest = 0
        for (const ft of fieldTokens) {
          if (ft === qt) tokenBest = Math.max(tokenBest, 1)
          else if (ft.startsWith(qt) || qt.startsWith(ft)) tokenBest = Math.max(tokenBest, 0.9)
          else tokenBest = Math.max(tokenBest, similarity(ft, qt))
        }
        sum += tokenBest
      }
      best = Math.max(best, (sum / queryTokens.length) * field.weight)
    }
  }

  return best
}

export interface SearchResult {
  business: Business
  score: number
}

/**
 * Fuzzy-search businesses by free text. Returns matches sorted by score.
 * `threshold` controls how forgiving the matching is.
 */
export function fuzzySearch(
  list: Business[],
  query: string,
  categories: Category[],
  threshold = 0.42,
): SearchResult[] {
  if (!query.trim()) return list.map((business) => ({ business, score: 0 }))

  return list
    .map((business) => ({ business, score: scoreBusiness(business, query, categories) }))
    .filter((r) => r.score >= threshold)
    .sort((a, b) => b.score - a.score)
}

/** Lightweight suggestions for the search box (names + categories). */
export function suggest(list: Business[], query: string, categories: Category[], limit = 6) {
  return fuzzySearch(list, query, categories, 0.4)
    .slice(0, limit)
    .map((r) => r.business)
}
