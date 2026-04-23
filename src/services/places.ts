const API_KEY = import.meta.env.VITE_GOOGLE_API_KEY as string

// Cache en mémoire pour éviter de refetcher le même restaurant
const cache = new Map<string, string | null>()

export async function fetchPlacePhoto(
  name: string,
  address: string
): Promise<string | null> {
  const cacheKey = `${name}__${address}`
  if (cache.has(cacheKey)) return cache.get(cacheKey)!

  try {
    // 1. Text Search pour trouver le place_id et les photos
    const searchRes = await fetch(
      'https://places.googleapis.com/v1/places:searchText',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Goog-Api-Key': API_KEY,
          'X-Goog-FieldMask': 'places.photos',
        },
        body: JSON.stringify({
          textQuery: `${name} ${address}`,
          languageCode: 'fr',
        }),
      }
    )

    const data = await searchRes.json()
    const photoName = data.places?.[0]?.photos?.[0]?.name

    if (!photoName) {
      cache.set(cacheKey, null)
      return null
    }

    // 2. URL de la photo (redirige directement vers l'image)
    const photoUrl =
      `https://places.googleapis.com/v1/${photoName}/media` +
      `?maxHeightPx=480&maxWidthPx=800&key=${API_KEY}`

    cache.set(cacheKey, photoUrl)
    return photoUrl
  } catch {
    cache.set(cacheKey, null)
    return null
  }
}
