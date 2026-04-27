const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string

export interface PlaceData {
  photoUrl: string | null
  rating: number | null
  priceRange: string | null
  description: string | null
  cuisine: string | null
}

const CACHE_PREFIX = 'places_v1__'
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000 // 7 jours

const memCache = new Map<string, PlaceData>()

function lsGet(key: string): PlaceData | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > CACHE_TTL_MS) { localStorage.removeItem(CACHE_PREFIX + key); return null }
    return data as PlaceData
  } catch { return null }
}

function lsSet(key: string, data: PlaceData) {
  try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function mapPriceLevel(level: string): string | null {
  const map: Record<string, string> = {
    PRICE_LEVEL_INEXPENSIVE: '€',
    PRICE_LEVEL_MODERATE: '€€',
    PRICE_LEVEL_EXPENSIVE: '€€€',
    PRICE_LEVEL_VERY_EXPENSIVE: '€€€€',
  }
  return map[level] ?? null
}

export async function fetchPlaceDetails(
  name: string,
  address: string
): Promise<PlaceData> {
  const cacheKey = `${name}__${address}`
  if (memCache.has(cacheKey)) return memCache.get(cacheKey)!
  const cached = lsGet(cacheKey)
  if (cached) { memCache.set(cacheKey, cached); return cached }

  const empty: PlaceData = { photoUrl: null, rating: null, priceRange: null, description: null, cuisine: null }

  try {
    const searchRes = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.photos,places.rating,places.priceLevel,places.editorialSummary,places.primaryTypeDisplayName',
        },
        body: JSON.stringify({
          textQuery: `${name} ${address}`,
          languageCode: 'fr',
        }),
      }
    )

    const data = await searchRes.json()
    const place = data.places?.[0]

    if (!place) {
      memCache.set(cacheKey, empty)
      lsSet(cacheKey, empty)
      return empty
    }

    const photoName = place.photos?.[0]?.name
    const photoUrl = photoName
      ? `https://places.googleapis.com/v1/${photoName}/media?maxHeightPx=480&maxWidthPx=800&key=${API_KEY}`
      : null

    const result: PlaceData = {
      photoUrl,
      rating: place.rating ?? null,
      priceRange: place.priceLevel ? mapPriceLevel(place.priceLevel) : null,
      description: place.editorialSummary?.text ?? null,
      cuisine: place.primaryTypeDisplayName?.text ?? null,
    }

    memCache.set(cacheKey, result)
    lsSet(cacheKey, result)
    return result
  } catch {
    memCache.set(cacheKey, empty)
    return empty
  }
}

// Backward compat
export async function fetchPlacePhoto(name: string, address: string): Promise<string | null> {
  return (await fetchPlaceDetails(name, address)).photoUrl
}
