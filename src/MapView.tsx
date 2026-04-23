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

function createEmojiIcon(emoji: string, color: string, active: boolean) {
  return L.divIcon({
    html: `<div class="map-pin ${active ? 'map-pin--active' : ''}" style="background:${color}">${emoji}</div>`,
    className: '',
    iconSize: [44, 44],
    iconAnchor: [22, 44],
    popupAnchor: [0, -48],
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
      <button className="map-detail-close" onClick={onClose}><span className="mi">close</span></button>
      <div
        className="map-detail-cover"
        style={photoUrl
          ? { backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: restaurant.cover }
        }
      />
      <div className="map-detail-body">
        <h2 className="map-detail-name">{restaurant.name}</h2>
        <p className="map-detail-address"><span className="mi">location_on</span> {restaurant.address}</p>

        <div className="map-detail-chips">
          <span className="map-chip map-chip--cuisine">{restaurant.cuisine}</span>
          <span className="map-chip map-chip--price">{restaurant.priceRange}</span>
        </div>

        <div className="map-detail-row">
          <div className="map-detail-block">
            <p className="map-detail-label">Note</p>
            <div className="map-detail-rating">
              <span className="map-rating-stars">{'★'.repeat(Math.floor(restaurant.rating))}{restaurant.rating % 1 >= 0.5 ? '½' : ''}</span>
              <span className="map-rating-value">{restaurant.rating.toFixed(1)}</span>
              <span className="map-rating-source">Google</span>
            </div>
          </div>
        </div>

        <div className="map-detail-influencer">
          <span className="map-influencer-avatar">{restaurant.recommendedBy.avatar}</span>
          <div>
            <p className="map-influencer-name">Recommandé par {restaurant.recommendedBy.handle}</p>
            <p className="map-influencer-handle">{restaurant.recommendedBy.followers} abonnés</p>
          </div>
        </div>

        <p className="map-detail-desc">{restaurant.description}</p>

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
}

export function MapView({ restaurants }: MapViewProps) {
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const center: [number, number] = [48.8566, 2.3522]

  function handleSelect(r: Restaurant) {
    setSelected(prev => prev?.id === r.id ? null : r)
  }

  function handleClose() {
    setSelected(null)
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FlyTo restaurant={selected} />
        <MapClickHandler onClose={handleClose} />
        {restaurants.map(r => (
          <Marker
            key={r.id}
            position={[r.lat, r.lng]}
            icon={createEmojiIcon(r.coverEmoji, r.cover, selected?.id === r.id)}
            eventHandlers={{
              click: (e) => {
                e.originalEvent.stopPropagation()
                handleSelect(r)
              }
            }}
          />
        ))}
      </MapContainer>

      {selected && (
        <DetailPanel restaurant={selected} onClose={handleClose} />
      )}
    </div>
  )
}
