import { useState, useEffect } from 'react'
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import type { Restaurant } from './data'

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

function FitBounds({ restaurants, active }: { restaurants: Restaurant[], active: boolean }) {
  const map = useMap()
  useEffect(() => {
    if (!active || restaurants.length === 0) return
    if (restaurants.length === 1) {
      map.flyTo([restaurants[0].lat, restaurants[0].lng], 15, { duration: 0.5 })
      return
    }
    const bounds = L.latLngBounds(restaurants.map(r => [r.lat, r.lng] as [number, number]))
    map.flyToBounds(bounds, { padding: [50, 50], maxZoom: 15, duration: 0.5 })
  }, [restaurants, active, map])
  return null
}

// Close panel when clicking on map background
function MapClickHandler({ onClose }: { onClose: () => void }) {
  useMapEvents({ click: onClose })
  return null
}


interface MapViewProps {
  restaurants: Restaurant[]
  searchActive?: boolean
  externalSelected?: Restaurant | null
  onExternalClose?: () => void
  onSelect?: (r: Restaurant | null) => void
}

export function MapView({ restaurants, searchActive, externalSelected, onExternalClose, onSelect }: MapViewProps) {
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
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a> &copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <FlyTo restaurant={selected} />
        <FitBounds restaurants={restaurants} active={!!searchActive && !selected} />
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
