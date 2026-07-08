import { businesses, cities } from './data'
import type { City } from './types'

export interface MapBounds {
  north: number
  south: number
  east: number
  west: number
}

/** Geographic bounds covering all demo cities and businesses. */
export const MAP_BOUNDS: MapBounds = {
  north: 40.13,
  south: 39.87,
  east: -73.87,
  west: -74.13,
}

export interface MapPoint {
  lat: number
  lng: number
}

export function projectToMap(
  { lat, lng }: MapPoint,
  width: number,
  height: number,
  bounds: MapBounds = MAP_BOUNDS,
) {
  const x = ((lng - bounds.west) / (bounds.east - bounds.west)) * width
  const y = ((bounds.north - lat) / (bounds.north - bounds.south)) * height
  return { x, y }
}

export function unprojectFromMap(
  x: number,
  y: number,
  width: number,
  height: number,
  bounds: MapBounds = MAP_BOUNDS,
): MapPoint {
  const lng = bounds.west + (x / width) * (bounds.east - bounds.west)
  const lat = bounds.north - (y / height) * (bounds.north - bounds.south)
  return { lat, lng }
}

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

export function originAreaLabel(lat: number, lng: number): string {
  const city = nearestCity(lat, lng)
  const atCenter = Math.abs(city.lat - lat) < 0.008 && Math.abs(city.lng - lng) < 0.008
  return atCenter ? city.name : `Near ${city.name}`
}

/** Sample business positions for the decorative map dots. */
export const mapBusinessDots = businesses.map((b) => ({ lat: b.lat, lng: b.lng }))
