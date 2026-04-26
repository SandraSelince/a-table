import { useState, useMemo, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { RESTAURANTS, CITIES, CUISINES, type Influencer, type Restaurant } from './data'
import { MapView } from './MapView'
import { fetchPlaceDetails, type PlaceData } from './services/places'
import './App.css'

function usePlaceDetails(restaurant: Restaurant | null) {
  const [placeData, setPlaceData] = useState<PlaceData | null>(null)
  useEffect(() => {
    if (!restaurant) { setPlaceData(null); return }
    fetchPlaceDetails(restaurant.name, restaurant.address).then(setPlaceData)
  }, [restaurant?.id])
  return placeData
}



const INFLUENCERS: Influencer[] = [
  ...new Map(
    RESTAURANTS.map(r => [r.recommendedBy.handle, r.recommendedBy])
  ).values()
].sort((a, b) => {
  // sort by follower count descending (parse "1.4M" → 1400, "310K" → 310)
  const parse = (s: string) => parseFloat(s) * (s.endsWith('M') ? 1000 : 1)
  return parse(b.followers) - parse(a.followers)
})

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="star-rating">
      {'★'.repeat(Math.floor(rating))}
      {rating % 1 >= 0.5 ? '½' : ''}
      <span className="rating-value">{rating.toFixed(1)}</span>
    </span>
  )
}

function RestaurantCard({ restaurant, onClick, active }: { restaurant: Restaurant; onClick: () => void; active?: boolean }) {
  const [placeData, setPlaceData] = useState<PlaceData | null>(null)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          fetchPlaceDetails(restaurant.name, restaurant.address).then(setPlaceData)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [restaurant.id])

  useEffect(() => {
    if (active && ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [active])

  return (
    <article className={`card ${active ? 'card--active' : ''}`} onClick={onClick} ref={ref}>
      <div
        className="card-cover"
        style={placeData?.photoUrl
          ? { backgroundImage: `url(${placeData.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: restaurant.cover }
        }
      />
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-name">{restaurant.name}</h3>
          <StarRating rating={placeData?.rating ?? restaurant.rating} />
        </div>
        <p className="card-meta">
          <span>{placeData?.cuisine ?? restaurant.cuisine}</span>
          <span className="card-meta-dot">·</span>
          <span>{placeData?.priceRange ?? restaurant.priceRange}</span>
          <span className="card-meta-dot">·</span>
          <span>{restaurant.city}</span>
        </p>
        <div className="card-tags">
          {restaurant.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="card-influencer">
          <p className="influencer-handle">Recommandé par <strong>{restaurant.recommendedBy.handle}</strong></p>
          <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
        </div>
        {active && (
          <div className="card-expanded">
            <p className="card-description">{placeData?.description ?? restaurant.description}</p>
            <a
              href={restaurant.instagramPost}
              target="_blank"
              rel="noopener noreferrer"
              className="card-cta"
              onClick={e => e.stopPropagation()}
            >
              Voir sur Instagram
            </a>
          </div>
        )}
      </div>
    </article>
  )
}

function RestaurantSheet({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const placeData = usePlaceDetails(restaurant)
  return (
    <>
      <div className="rsheet-backdrop" onClick={onClose} />
      <div className="rsheet">
        <div
          className="rsheet-cover"
          style={placeData?.photoUrl
            ? { backgroundImage: `url(${placeData.photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: restaurant.cover }
          }
        >
          <div className="rsheet-handle" />
          <button className="rsheet-close" onClick={onClose}><span className="mi">close</span></button>
        </div>
        <div className="rsheet-body">
          <div className="rsheet-header">
            <h2 className="rsheet-name">{restaurant.name}</h2>
            <StarRating rating={placeData?.rating ?? restaurant.rating} />
          </div>
          <p className="rsheet-meta">{placeData?.cuisine ?? restaurant.cuisine} · {placeData?.priceRange ?? restaurant.priceRange} · {restaurant.city}</p>
          <div className="rsheet-tags">
            {restaurant.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
          </div>
          <p className="rsheet-description">{placeData?.description ?? restaurant.description}</p>
          <p className="influencer-handle">Recommandé par <strong>{restaurant.recommendedBy.handle}</strong></p>
          <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
          <a href={restaurant.instagramPost} target="_blank" rel="noopener noreferrer" className="rsheet-cta">
            Voir sur Instagram
          </a>
        </div>
      </div>
    </>
  )
}

function MapCardPreview({ restaurant, onClose, onOpen }: { restaurant: Restaurant; onClose: () => void; onOpen: () => void }) {
  const placeData = usePlaceDetails(restaurant)
  return (
    <div className="map-card-preview" onClick={onOpen}>
      <button className="map-card-preview-close" onClick={e => { e.stopPropagation(); onClose() }}>
        <span className="mi">close</span>
      </button>
      <div className="map-card-preview-cover" style={placeData?.photoUrl
        ? { backgroundImage: `url(${placeData.photoUrl})` }
        : { background: restaurant.cover }
      } />
      <div className="map-card-preview-body">
        <div className="map-card-preview-header">
          <h3 className="map-card-preview-name">{restaurant.name}</h3>
          <StarRating rating={placeData?.rating ?? restaurant.rating} />
        </div>
        <p className="map-card-preview-meta">{placeData?.cuisine ?? restaurant.cuisine} · {placeData?.priceRange ?? restaurant.priceRange} · {restaurant.city}</p>
        <div className="map-card-preview-tags">
          {restaurant.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      </div>
    </div>
  )
}

interface FilterDropdownProps {
  label: string
  value: string
  children: React.ReactNode
}

function FilterDropdown({ value, children }: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  return (
    <div className={`filter-dropdown ${open ? 'filter-dropdown--open' : ''}`} ref={ref}>
      <button className="filter-dropdown-btn" onClick={() => setOpen(v => !v)}>
        <span className="filter-dropdown-value">{value}</span>
        <span className="mi filter-dropdown-arrow">{open ? 'expand_less' : 'expand_more'}</span>
      </button>
      {open && (
        <div className="filter-dropdown-panel">
          {children}
        </div>
      )}
    </div>
  )
}

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  onApply: () => void
  pendingCount: number
  children: React.ReactNode
}

function FilterSheet({ open, onClose, onApply, pendingCount, children }: FilterSheetProps) {
  return (
    <>
      {open && <div className="filter-sheet-backdrop" onClick={onClose} />}
      <div className={`filter-sheet ${open ? 'filter-sheet--open' : ''}`}>
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-header">
          <span className="filter-sheet-title">Filtres</span>
          <button className="filter-sheet-close" onClick={onClose}><span className="mi">close</span></button>
        </div>
        <div className="filter-sheet-body">
          {children}
        </div>
        <div className="filter-sheet-footer">
          <button className="filter-sheet-apply" onClick={onApply}>
            Appliquer{pendingCount > 0 ? ` · ${pendingCount} filtre${pendingCount > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </>
  )
}

type ViewMode = 'grid' | 'map'

interface Suggestion {
  label: string
  type: 'restaurant' | 'cuisine' | 'ville' | 'influenceur' | 'tag'
}

function useSearchSuggestions(query: string): Suggestion[] {
  return useMemo(() => {
    if (query.trim().length < 2) return []
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(query.trim())
    const seen = new Set<string>()
    const suggestions: Suggestion[] = []
    const add = (label: string, type: Suggestion['type']) => {
      const key = `${type}:${label}`
      if (!seen.has(key)) { seen.add(key); suggestions.push({ label, type }) }
    }
    for (const r of RESTAURANTS) {
      if (normalize(r.name).includes(q)) add(r.name, 'restaurant')
      if (normalize(r.cuisine).includes(q)) add(r.cuisine, 'cuisine')
      if (normalize(r.city).includes(q)) add(r.city, 'ville')
      if (normalize(r.recommendedBy.name).includes(q)) add(r.recommendedBy.name, 'influenceur')
      if (normalize(r.recommendedBy.handle).includes(q)) add(r.recommendedBy.handle, 'influenceur')
      for (const tag of r.tags) {
        if (normalize(tag).includes(q)) add(tag, 'tag')
      }
    }
    return suggestions.slice(0, 8)
  }, [query])
}

const SUGGESTION_ICON: Record<Suggestion['type'], string> = {
  restaurant: 'restaurant',
  cuisine: 'skillet',
  ville: 'location_on',
  influenceur: 'person',
  tag: 'label',
}

function toggle(arr: string[], value: string): string[] {
  return arr.includes(value) ? arr.filter(v => v !== value) : [...arr, value]
}

export function App() {
  const [selectedCities, setSelectedCities] = useState<string[]>([])
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>([])
  const [selectedInfluencers, setSelectedInfluencers] = useState<string[]>([])
  const [search, setSearch] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const searchWrapRef = useRef<HTMLDivElement>(null)
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [mapSelected, setMapSelected] = useState<Restaurant | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)
  const suggestions = useSearchSuggestions(search)

  // Pending state — mobile sheet uniquement
  const [pendingCities, setPendingCities] = useState<string[]>([])
  const [pendingCuisines, setPendingCuisines] = useState<string[]>([])
  const [pendingInfluencers, setPendingInfluencers] = useState<string[]>([])

  function openFilterSheet() {
    setPendingCities(selectedCities)
    setPendingCuisines(selectedCuisines)
    setPendingInfluencers(selectedInfluencers)
    setFilterSheetOpen(true)
  }

  function applyFilters() {
    setSelectedCities(pendingCities)
    setSelectedCuisines(pendingCuisines)
    setSelectedInfluencers(pendingInfluencers)
    setFilterSheetOpen(false)
  }

  function resetPending() {
    setPendingCities([])
    setPendingCuisines([])
    setPendingInfluencers([])
  }

  const activeFilterCount = selectedCities.length + selectedCuisines.length + selectedInfluencers.length

  const pendingFilterCount = pendingCities.length + pendingCuisines.length + pendingInfluencers.length

  function filterLabel(selected: string[], defaultLabel: string): string {
    if (selected.length === 0) return defaultLabel
    if (selected.length === 1) return selected[0]
    return `${selected[0]} +${selected.length - 1}`
  }

  const filtered = useMemo(() => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(search.trim())

    return RESTAURANTS.filter(r => {
      const matchCity = selectedCities.length === 0 || selectedCities.includes(r.city)
      const matchCuisine = selectedCuisines.length === 0 || selectedCuisines.includes(r.cuisine)
      const matchInfluencer = selectedInfluencers.length === 0 || selectedInfluencers.includes(r.recommendedBy.handle)
      const matchSearch = q === '' || [
        r.name,
        r.cuisine,
        r.city,
        r.address,
        r.description,
        r.priceRange,
        r.recommendedBy.name,
        r.recommendedBy.handle,
        ...r.tags,
      ].some(field => normalize(field).includes(q))
      return matchCity && matchCuisine && matchInfluencer && matchSearch
    })
  }, [selectedCities, selectedCuisines, selectedInfluencers, search])

  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 1024 && selected) {
        setMapSelected(selected)
        setSelected(null)
      }
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [selected])

  function resetFilters() {
    setSelectedCities([])
    setSelectedCuisines([])
    setSelectedInfluencers([])
    setSearch('')
  }

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <div className="header-brand">
            <div>
              <h1 className="header-title">La Table</h1>
              <p className="header-sub">Les restos des influenceurs</p>
            </div>
          </div>
          <div className="header-search-wrap" ref={searchWrapRef}>
            <div className="header-search">
              <span className="mi search-icon">search</span>
              <input
                className="search-input"
                type="text"
                placeholder="Restaurant, cuisine, ville…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                onFocus={() => { setSelected(null); setSearchFocused(true) }}
                onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
              />
              {search && (
                <button className="search-clear" onClick={() => setSearch('')}>
                  <span className="mi">close</span>
                </button>
              )}
            </div>
            {searchFocused && suggestions.length > 0 && (
              <div className="search-suggestions">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    className="search-suggestion-item"
                    onMouseDown={() => { setSearch(s.label); setSearchFocused(false) }}
                  >
                    <span className="mi search-suggestion-icon">{SUGGESTION_ICON[s.type]}</span>
                    <span className="search-suggestion-label">{s.label}</span>
                    <span className="search-suggestion-type">{s.type}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="filters filters--desktop">
            <FilterDropdown label="Ville" value={filterLabel(selectedCities, 'Toutes les villes')}>
              <div className="pills">
                {CITIES.slice(1).map(city => (
                  <button key={city} className={`pill ${selectedCities.includes(city) ? 'pill--active' : ''}`} onClick={() => setSelectedCities(toggle(selectedCities, city))}>{city}</button>
                ))}
              </div>
            </FilterDropdown>
            <FilterDropdown label="Cuisine" value={filterLabel(selectedCuisines, 'Toutes les cuisines')}>
              <div className="pills">
                {CUISINES.slice(1).map(cuisine => (
                  <button key={cuisine} className={`pill ${selectedCuisines.includes(cuisine) ? 'pill--active' : ''}`} onClick={() => setSelectedCuisines(toggle(selectedCuisines, cuisine))}>{cuisine}</button>
                ))}
              </div>
            </FilterDropdown>
            <FilterDropdown label="Influenceur" value={filterLabel(selectedInfluencers.map(h => INFLUENCERS.find(i => i.handle === h)?.name ?? h), 'Tous les influenceurs')}>
              <div className="pills">
                {INFLUENCERS.map(inf => (
                  <button key={inf.handle} className={`pill pill--influencer ${selectedInfluencers.includes(inf.handle) ? 'pill--active' : ''}`} onClick={() => setSelectedInfluencers(toggle(selectedInfluencers, inf.handle))}>
                    {inf.name}<span className="pill-followers">{inf.followers}</span>
                  </button>
                ))}
              </div>
            </FilterDropdown>
            {activeFilterCount > 0 && <button className="filter-reset" onClick={resetFilters}>Réinitialiser</button>}
          </div>

          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'grid' ? 'view-btn--active' : ''}`}
              onClick={() => setView('grid')}
              title="Vue grille"
            >
              <span className="mi">grid_view</span> Grille
            </button>
            <button
              className={`view-btn ${view === 'map' ? 'view-btn--active' : ''}`}
              onClick={() => setView('map')}
              title="Vue carte"
            >
              <span className="mi">map</span> Carte
            </button>
          </div>
        </div>
      </header>

      <main className="main main--map">

        {/* Mobile filter button */}
        <div className="filters--mobile">
          <div className="filters--mobile-row">
            <button className="filter-mobile-btn" onClick={openFilterSheet}>
              <span className="mi">tune</span> Filtres
              {activeFilterCount > 0 && (
                <span className="filter-mobile-badge">{activeFilterCount}</span>
              )}
            </button>
            {activeFilterCount > 0 && (
              <button className="filter-reset" onClick={resetFilters}>
                Réinitialiser
              </button>
            )}
          </div>
          <p className="hero-count hero-count--mobile">
            <strong>{filtered.length}</strong> adresse{filtered.length !== 1 ? 's' : ''} sélectionnée{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

        <FilterSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          onApply={applyFilters}
          pendingCount={pendingFilterCount}
        >
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Ville</p>
            <div className="pills">
              {CITIES.slice(1).map(city => (
                <button
                  key={city}
                  className={`pill ${pendingCities.includes(city) ? 'pill--active' : ''}`}
                  onClick={() => setPendingCities(toggle(pendingCities, city))}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Cuisine</p>
            <div className="pills">
              {CUISINES.slice(1).map(cuisine => (
                <button
                  key={cuisine}
                  className={`pill ${pendingCuisines.includes(cuisine) ? 'pill--active' : ''}`}
                  onClick={() => setPendingCuisines(toggle(pendingCuisines, cuisine))}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Influenceur</p>
            <div className="pills">
              {INFLUENCERS.map(inf => (
                <button
                  key={inf.handle}
                  className={`pill pill--influencer ${pendingInfluencers.includes(inf.handle) ? 'pill--active' : ''}`}
                  onClick={() => setPendingInfluencers(toggle(pendingInfluencers, inf.handle))}
                >
                  {inf.name}
                  <span className="pill-followers">{inf.followers}</span>
                </button>
              ))}
            </div>
          </div>
          {pendingFilterCount > 0 && (
            <button className="filter-reset" onClick={resetPending}>
              Réinitialiser
            </button>
          )}
        </FilterSheet>

        <div className="content-area">
          <div className={`content-list ${view === 'map' ? 'content-list--mobile-hidden' : ''}`}>
            {filtered.length === 0 ? (
              <div className="empty">
                <p>Aucun restaurant trouvé pour ces critères.</p>
                <button className="pill pill--active" onClick={resetFilters}>Réinitialiser les filtres</button>
              </div>
            ) : (
              <div className="grid">
                {filtered.map(r => (
                  <RestaurantCard key={r.id} restaurant={r} active={mapSelected?.id === r.id} onClick={() => {
                    if (window.innerWidth >= 1024) setMapSelected(r)
                    else setSelected(r)
                  }} />
                ))}
              </div>
            )}
          </div>
          <div className="content-map">
            <MapView
              restaurants={filtered}
              externalSelected={window.innerWidth >= 1024 ? mapSelected : undefined}
              onExternalClose={() => setMapSelected(null)}
              onSelect={r => setMapSelected(r)}
            />
            {mapSelected && (
              <MapCardPreview
                restaurant={mapSelected}
                onClose={() => setMapSelected(null)}
                onOpen={() => setSelected(mapSelected)}
              />
            )}
          </div>
        </div>
      </main>



      {selected && createPortal(
        <RestaurantSheet restaurant={selected} onClose={() => setSelected(null)} />,
        document.body
      )}
    </div>
  )
}
