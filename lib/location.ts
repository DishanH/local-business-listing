import { cities } from './data'
import type { City } from './types'

export function nearestCity(lat: number, lng: number, list: City[] = cities): City {
  let best = list[0]
  let bestDist = Infinity
  for (const city of list) {
    const d = (city.lat - lat) ** 2 + (city.lng - lng) ** 2
    if (d < bestDist) {
      bestDist = d
      best = city
    }
  }
  return best
}

export function originAreaLabel(lat: number, lng: number, list: City[] = cities): string {
  const city = nearestCity(lat, lng, list)
  const atCenter = Math.abs(city.lat - lat) < 0.008 && Math.abs(city.lng - lng) < 0.008
  return atCenter ? city.name : `Near ${city.name}`
}
