const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string

export interface PlaceData {
  photoUrl: string | null
  rating: number | null
  priceRange: string | null
  description: string | null
  cuisine: string | null
}

const cache = new Map<string, PlaceData>()

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
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

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
      cache.set(cacheKey, empty)
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

    cache.set(cacheKey, result)
    return result
  } catch {
    cache.set(cacheKey, empty)
    return empty
  }
}

// Backward compat
export async function fetchPlacePhoto(name: string, address: string): Promise<string | null> {
  return (await fetchPlaceDetails(name, address)).photoUrl
}
