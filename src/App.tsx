import { useState, useMemo, useRef, useEffect } from 'react'
import { RESTAURANTS, CITIES, CUISINES, type Influencer, type Restaurant } from './data'
import { MapView } from './MapView'
import { fetchPlacePhoto } from './services/places'
import './App.css'

function usePlacePhoto(restaurant: Restaurant | null) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  useEffect(() => {
    if (!restaurant) { setPhotoUrl(null); return }
    fetchPlacePhoto(restaurant.name, restaurant.address).then(setPhotoUrl)
  }, [restaurant?.id])
  return photoUrl
}

const ALL_INFLUENCERS = 'Tous les influenceurs'

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

function RestaurantCard({ restaurant, onClick }: { restaurant: Restaurant; onClick: () => void }) {
  const [photoUrl, setPhotoUrl] = useState<string | null>(null)
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          observer.disconnect()
          fetchPlacePhoto(restaurant.name, restaurant.address).then(setPhotoUrl)
        }
      },
      { rootMargin: '200px' }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [restaurant.id])

  return (
    <article className="card" onClick={onClick} ref={ref}>
      <div
        className="card-cover"
        style={photoUrl
          ? { backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
          : { background: restaurant.cover }
        }
      >
        <div className="card-cover-overlay">
          <span className="card-cuisine-badge">{restaurant.cuisine}</span>
          <div className="card-cover-rating">
            <span className="card-cover-star">★</span>
            <span className="card-cover-score">{restaurant.rating}</span>
          </div>
        </div>
        <span className="card-price">{restaurant.priceRange}</span>
      </div>
      <div className="card-body">
        <h3 className="card-name">{restaurant.name}</h3>
        <p className="card-meta"><span className="mi" style={{fontSize:'14px',marginRight:'2px'}}>location_on</span>{restaurant.city}</p>
        <div className="card-tags">
          {restaurant.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="card-influencer">
          <div>
            <p className="influencer-handle">Recommandé par <strong>{restaurant.recommendedBy.handle}</strong></p>
            <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
          </div>
        </div>
      </div>
    </article>
  )
}

function Modal({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  const photoUrl = usePlacePhoto(restaurant)
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}><span className="mi">close</span></button>
        <div
          className="modal-cover"
          style={photoUrl
            ? { backgroundImage: `url(${photoUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : { background: restaurant.cover }
          }
        />
        <div className="modal-body">
          <div className="modal-top">
            <div>
              <h2 className="modal-name">{restaurant.name}</h2>
              <p className="modal-meta">{restaurant.cuisine} · {restaurant.city} · {restaurant.priceRange}</p>
            </div>
            <StarRating rating={restaurant.rating} />
          </div>
          <p className="modal-address"><span className="mi">location_on</span> {restaurant.address}</p>
          <p className="modal-description">{restaurant.description}</p>
          <div className="modal-tags">
            {restaurant.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="modal-influencer">
            <span className="influencer-avatar">{restaurant.recommendedBy.avatar}</span>
            <div>
              <p className="influencer-handle">Recommandé par <strong>{restaurant.recommendedBy.handle}</strong></p>
              <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
            </div>
          </div>
          <a
            href={restaurant.instagramPost}
            target="_blank"
            rel="noopener noreferrer"
            className="modal-cta"
          >
            Voir sur Instagram
          </a>
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

function FilterDropdown({ label, value, children }: FilterDropdownProps) {
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
        <span className="filter-dropdown-label">{label}</span>
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

export function App() {
  const [selectedCity, setSelectedCity] = useState('Toutes les villes')
  const [selectedCuisine, setSelectedCuisine] = useState('Toutes les cuisines')
  const [selectedInfluencer, setSelectedInfluencer] = useState(ALL_INFLUENCERS)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Restaurant | null>(null)
  const [view, setView] = useState<ViewMode>('grid')
  const [filterSheetOpen, setFilterSheetOpen] = useState(false)

  // Pending state — utilisé uniquement dans le sheet mobile, appliqué au clic sur "Appliquer"
  const [pendingCity, setPendingCity] = useState('Toutes les villes')
  const [pendingCuisine, setPendingCuisine] = useState('Toutes les cuisines')
  const [pendingInfluencer, setPendingInfluencer] = useState(ALL_INFLUENCERS)

  function openFilterSheet() {
    setPendingCity(selectedCity)
    setPendingCuisine(selectedCuisine)
    setPendingInfluencer(selectedInfluencer)
    setFilterSheetOpen(true)
  }

  function applyFilters() {
    setSelectedCity(pendingCity)
    setSelectedCuisine(pendingCuisine)
    setSelectedInfluencer(pendingInfluencer)
    setFilterSheetOpen(false)
  }

  function resetPending() {
    setPendingCity('Toutes les villes')
    setPendingCuisine('Toutes les cuisines')
    setPendingInfluencer(ALL_INFLUENCERS)
  }

  const activeFilterCount = [
    selectedCity !== 'Toutes les villes',
    selectedCuisine !== 'Toutes les cuisines',
    selectedInfluencer !== ALL_INFLUENCERS,
  ].filter(Boolean).length

  const pendingFilterCount = [
    pendingCity !== 'Toutes les villes',
    pendingCuisine !== 'Toutes les cuisines',
    pendingInfluencer !== ALL_INFLUENCERS,
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    const normalize = (s: string) =>
      s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const q = normalize(search.trim())

    return RESTAURANTS.filter(r => {
      const matchCity = selectedCity === 'Toutes les villes' || r.city === selectedCity
      const matchCuisine = selectedCuisine === 'Toutes les cuisines' || r.cuisine === selectedCuisine
      const matchInfluencer = selectedInfluencer === ALL_INFLUENCERS || r.recommendedBy.handle === selectedInfluencer
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
  }, [selectedCity, selectedCuisine, selectedInfluencer, search])

  function resetFilters() {
    setSelectedCity('Toutes les villes')
    setSelectedCuisine('Toutes les cuisines')
    setSelectedInfluencer(ALL_INFLUENCERS)
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
          <div className="header-search">
            <span className="mi search-icon">search</span>
            <input
              className="search-input"
              type="text"
              placeholder="Restaurant, cuisine, ville…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSelected(null)}
            />
            {search && (
              <button className="search-clear" onClick={() => setSearch('')}>
                <span className="mi">close</span>
              </button>
            )}
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

      <main className={`main ${view === 'map' ? 'main--map' : ''}`}>
        {view === 'grid' && (
          <section className="hero">
            <p className="hero-count">
              <strong>{filtered.length}</strong> adresse{filtered.length !== 1 ? 's' : ''} sélectionnée{filtered.length !== 1 ? 's' : ''} par les meilleurs influenceurs
            </p>
          </section>
        )}

        {/* Desktop dropdowns */}
        <div className="filters filters--desktop">
          <FilterDropdown label="Ville" value={selectedCity}>
            <div className="pills">
              {CITIES.map(city => (
                <button
                  key={city}
                  className={`pill ${selectedCity === city ? 'pill--active' : ''}`}
                  onClick={() => setSelectedCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </FilterDropdown>

          <FilterDropdown label="Cuisine" value={selectedCuisine}>
            <div className="pills">
              {CUISINES.map(cuisine => (
                <button
                  key={cuisine}
                  className={`pill ${selectedCuisine === cuisine ? 'pill--active' : ''}`}
                  onClick={() => setSelectedCuisine(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </FilterDropdown>

          <FilterDropdown
            label="Influenceur"
            value={selectedInfluencer === ALL_INFLUENCERS ? 'Tous' : INFLUENCERS.find(i => i.handle === selectedInfluencer)?.name ?? 'Tous'}
          >
            <div className="pills">
              <button
                className={`pill ${selectedInfluencer === ALL_INFLUENCERS ? 'pill--active' : ''}`}
                onClick={() => setSelectedInfluencer(ALL_INFLUENCERS)}
              >
                Tous
              </button>
              {INFLUENCERS.map(inf => (
                <button
                  key={inf.handle}
                  className={`pill pill--influencer ${selectedInfluencer === inf.handle ? 'pill--active' : ''}`}
                  onClick={() => setSelectedInfluencer(inf.handle)}
                >
                  <span className="pill-avatar">{inf.avatar}</span>
                  {inf.name}
                  <span className="pill-followers">{inf.followers}</span>
                </button>
              ))}
            </div>
          </FilterDropdown>

          {activeFilterCount > 0 && (
            <button className="filter-reset" onClick={resetFilters}>
              Réinitialiser
            </button>
          )}

          <p className="hero-count filters-count--desktop">
            <strong>{filtered.length}</strong> adresse{filtered.length !== 1 ? 's' : ''} sélectionnée{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>

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
              {CITIES.map(city => (
                <button
                  key={city}
                  className={`pill ${pendingCity === city ? 'pill--active' : ''}`}
                  onClick={() => setPendingCity(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Cuisine</p>
            <div className="pills">
              {CUISINES.map(cuisine => (
                <button
                  key={cuisine}
                  className={`pill ${pendingCuisine === cuisine ? 'pill--active' : ''}`}
                  onClick={() => setPendingCuisine(cuisine)}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Influenceur</p>
            <div className="pills">
              <button
                className={`pill ${pendingInfluencer === ALL_INFLUENCERS ? 'pill--active' : ''}`}
                onClick={() => setPendingInfluencer(ALL_INFLUENCERS)}
              >
                Tous
              </button>
              {INFLUENCERS.map(inf => (
                <button
                  key={inf.handle}
                  className={`pill pill--influencer ${pendingInfluencer === inf.handle ? 'pill--active' : ''}`}
                  onClick={() => setPendingInfluencer(inf.handle)}
                >
                  <span className="pill-avatar">{inf.avatar}</span>
                  {inf.name}
                  <span className="pill-followers">{inf.followers}</span>
                </button>
              ))}
            </div>
          </div>
          {pendingFilterCount > 0 && (
            <button className="pill filter-sheet-reset" onClick={resetPending}>
              Réinitialiser
            </button>
          )}
        </FilterSheet>

        {view === 'map' ? (
          <MapView restaurants={filtered} />
        ) : filtered.length === 0 ? (
          <div className="empty">
            <p>Aucun restaurant trouvé pour ces critères.</p>
            <button className="pill pill--active" onClick={resetFilters}>Réinitialiser les filtres</button>
          </div>
        ) : (
          <div className="grid">
            {filtered.map(r => (
              <RestaurantCard key={r.id} restaurant={r} onClick={() => setSelected(r)} />
            ))}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>© 2025 La Table · Les adresses vérifiées par les influenceurs</p>
      </footer>

      {selected && (
        <Modal restaurant={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}
