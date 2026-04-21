import { useState, useMemo, useRef, useEffect } from 'react'
import { RESTAURANTS, CITIES, CUISINES, type Influencer, type Restaurant } from './data'
import { MapView } from './MapView'
import './App.css'

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
  return (
    <article className="card" onClick={onClick}>
      <div className="card-cover" style={{ background: restaurant.cover }}>
        <span className="card-price">{restaurant.priceRange}</span>
      </div>
      <div className="card-body">
        <div className="card-header">
          <h3 className="card-name">{restaurant.name}</h3>
          <StarRating rating={restaurant.rating} />
        </div>
        <p className="card-meta">{restaurant.cuisine} · {restaurant.city}</p>
        <div className="card-tags">
          {restaurant.tags.map(tag => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
        <div className="card-influencer">
          <span className="influencer-avatar">{restaurant.recommendedBy.avatar}</span>
          <div>
            <p className="influencer-handle">{restaurant.recommendedBy.handle}</p>
            <p className="influencer-followers">{restaurant.recommendedBy.followers} abonnés</p>
          </div>
        </div>
      </div>
    </article>
  )
}

function Modal({ restaurant, onClose }: { restaurant: Restaurant; onClose: () => void }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✕</button>
        <div className="modal-cover" style={{ background: restaurant.cover }} />
        <div className="modal-body">
          <div className="modal-top">
            <div>
              <h2 className="modal-name">{restaurant.name}</h2>
              <p className="modal-meta">{restaurant.cuisine} · {restaurant.city} · {restaurant.priceRange}</p>
            </div>
            <StarRating rating={restaurant.rating} />
          </div>
          <p className="modal-address">📍 {restaurant.address}</p>
          <p className="modal-description">{restaurant.description}</p>
          <div className="modal-tags">
            {restaurant.tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
          <div className="modal-influencer">
            <span className="influencer-avatar">{restaurant.recommendedBy.avatar}</span>
            <div>
              <p className="influencer-name">Recommandé par {restaurant.recommendedBy.name}</p>
              <p className="influencer-handle">{restaurant.recommendedBy.handle} · {restaurant.recommendedBy.followers} abonnés</p>
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
        <span className="filter-dropdown-arrow">{open ? '▲' : '▼'}</span>
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
  activeCount: number
  onReset: () => void
  children: React.ReactNode
}

function FilterSheet({ open, onClose, children }: FilterSheetProps) {
  return (
    <>
      {open && <div className="filter-sheet-backdrop" onClick={onClose} />}
      <div className={`filter-sheet ${open ? 'filter-sheet--open' : ''}`}>
        <div className="filter-sheet-handle" />
        <div className="filter-sheet-header">
          <span className="filter-sheet-title">Filtres</span>
          <button className="filter-sheet-close" onClick={onClose}>✕</button>
        </div>
        <div className="filter-sheet-body">
          {children}
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

  const activeFilterCount = [
    selectedCity !== 'Toutes les villes',
    selectedCuisine !== 'Toutes les cuisines',
    selectedInfluencer !== ALL_INFLUENCERS,
  ].filter(Boolean).length

  const filtered = useMemo(() => {
    return RESTAURANTS.filter(r => {
      const matchCity = selectedCity === 'Toutes les villes' || r.city === selectedCity
      const matchCuisine = selectedCuisine === 'Toutes les cuisines' || r.cuisine === selectedCuisine
      const matchInfluencer = selectedInfluencer === ALL_INFLUENCERS || r.recommendedBy.handle === selectedInfluencer
      const matchSearch = search.trim() === '' ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
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
            <span className="header-logo">🍽️</span>
            <div>
              <h1 className="header-title">La Table</h1>
              <p className="header-sub">Les restos des influenceurs</p>
            </div>
          </div>
          <div className="header-search">
            <span className="search-icon">🔍</span>
            <input
              className="search-input"
              type="text"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="view-toggle">
            <button
              className={`view-btn ${view === 'grid' ? 'view-btn--active' : ''}`}
              onClick={() => setView('grid')}
              title="Vue grille"
            >
              ▦ Grille
            </button>
            <button
              className={`view-btn ${view === 'map' ? 'view-btn--active' : ''}`}
              onClick={() => setView('map')}
              title="Vue carte"
            >
              🗺 Carte
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
        </div>

        {/* Mobile filter button */}
        <div className="filters--mobile">
          <button className="filter-mobile-btn" onClick={() => setFilterSheetOpen(true)}>
            <span>⚙ Filtres</span>
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

        <FilterSheet
          open={filterSheetOpen}
          onClose={() => setFilterSheetOpen(false)}
          activeCount={activeFilterCount}
          onReset={resetFilters}
        >
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Ville</p>
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
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Cuisine</p>
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
          </div>
          <div className="filter-sheet-group">
            <p className="filter-sheet-group-label">Influenceur</p>
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
          </div>
          {activeFilterCount > 0 && (
            <button className="pill pill--active filter-sheet-reset" onClick={() => { resetFilters(); setFilterSheetOpen(false) }}>
              Réinitialiser les filtres
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
