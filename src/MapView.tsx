import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Restaurant } from './data'
import { fetchPlacePhoto } from './services/places'
import 'leaflet/dist/leaflet.css'
import './MapView.css'

delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createPin(active: boolean) {
  return L.divIcon({
    html: `<div class="map-pin ${active ? 'map-pin--active' : ''}"><div class="map-pin-dot"></div></div>`,
    className: '',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -14],
  })
}

function FlyTo({ restaurant }: { restaurant: Restaurant | null }) {
  const map = useMap()
  useEffect(() => {
    if (restaurant) {
      map.flyTo([restaurant.lat, restaurant.lng], 15, { duration: 0.7 })
    }
  }, [restaurant, map])
  return null
}

// Close panel when clicking on map background
function MapClickHandler({ onClose }: { onClose: () => void }) {
  useMapEvents({ click: onClose })
  return null
}

function DetailPanel({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  useEffect(() => {
    fetchPlacePhoto(restaurant.name, restaurant.address).then(setPhotoUrl)
  }, [restaurant.id])

  return (
    <div className="map-detail">
      <div
        className="map-detail-cover"
        style={photoUrl
          ? { backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: restaurant.cover }
        }
      />
      <button className="map-detail-close" onClick={onClose}><span className="mi">close</span></button>

      <div className="map-detail-body">
        <div className="map-detail-header">
          <h2 className="map-detail-name">{restaurant.name}</h2>
          <span className="map-detail-rating">
            {'★'.repeat(Math.floor(restaurant.rating))}{restaurant.rating % 1 >= 0.5 ? '½' : ''}
            <span className="map-rating-value">{restaurant.rating.toFixed(1)}</span>
          </span>
        </div>

        <p className="map-detail-meta">
          <span>{restaurant.cuisine}</span>
          <span className="map-meta-dot">·</span>
          <span>{restaurant.priceRange}</span>
          <span className="map-meta-dot">·</span>
          <span>{restaurant.city}</span>
        </p>

        <div className="map-detail-tags">
          {restaurant.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>

        <p className="map-detail-desc">{restaurant.description}</p>

        <div className="map-detail-influencer">
          <p className="influencer-handle">Recommandé par <strong>{restaurant.recommendedBy.handle}</strong></p>
          <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
        </div>

        <a
          href={restaurant.instagramPost}
          target="_blank"
          rel="noopener noreferrer"
          className="map-detail-cta"
        >
          Voir sur Instagram
        </a>
      </div>
    </div>
  )
}

interface MapViewProps {
  restaurants: Restaurant[]
  externalSelected?: Restaurant | null
  onExternalClose?: () => void
  onSelect?: (r: Restaurant | null) => void
}

export function MapView({ restaurants, externalSelected, onExternalClose, onSelect }: MapViewProps) {
  const [internalSelected, setInternalSelected] = useState<Restaurant | null>(null)
  const center: [number, number] = [48.8566, 2.3522]

  const selected = externalSelected !== undefined ? externalSelected : internalSelected

  function handleSelect(r: Restaurant) {
    const next = selected?.id === r.id ? null : r
    if (externalSelected !== undefined) {
      onSelect?.(next)
    } else {
      setInternalSelected(next)
      onSelect?.(next)
    }
  }

  function handleClose() {
    if (onExternalClose) onExternalClose()
    else setInternalSelected(null)
    onSelect?.(null)
  }

  return (
    <div className={`map-page ${selected ? 'map-page--open' : ''}`}>
      <MapContainer
        center={center}
        zoom={13}
        className="map-canvas"
        scrollWheelZoom
        touchZoom
        doubleClickZoom
        zoomControl
      >
        <TileLayer
          attribution='Tiles &copy; <a href="https://www.esri.com/">Esri</a>'
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}"
        />
        <FlyTo restaurant={selected} />
        <MapClickHandler onClose={handleClose} />
        {restaurants.map(r => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={createPin(selected?.id === r.id)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                handleSelect(r)
              }
            }}
          />
        ))}
      </MapContainer>

    </div>
  )
}
