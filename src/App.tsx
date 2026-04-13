import { useState, useMemo } from 'react'
import { RESTAURANTS, CITIES, CUISINES, type Restaurant } from './data'
import './App.css'

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
    <article className="card" onClick={onClick} style={{ '--card-bg': restaurant.cover } as React.CSSProperties}>
      <div className="card-cover" style={{ background: restaurant.cover }}>
        <span className="card-emoji">{restaurant.coverEmoji}</span>
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
            <p className="influencer-name">{restaurant.recommendedBy.name}</p>
            <p className="influencer-handle">{restaurant.recommendedBy.handle} · {restaurant.recommendedBy.followers} abonnés</p>
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
        <div className="modal-cover" style={{ background: restaurant.cover }}>
          <span className="modal-emoji">{restaurant.coverEmoji}</span>
        </div>
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

export function App() {
  const [selectedCity, setSelectedCity] = useState('Toutes les villes')
  const [selectedCuisine, setSelectedCuisine] = useState('Toutes les cuisines')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Restaurant | null>(null)

  const filtered = useMemo(() => {
    return RESTAURANTS.filter(r => {
      const matchCity = selectedCity === 'Toutes les villes' || r.city === selectedCity
      const matchCuisine = selectedCuisine === 'Toutes les cuisines' || r.cuisine === selectedCuisine
      const matchSearch = search.trim() === '' ||
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.cuisine.toLowerCase().includes(search.toLowerCase()) ||
        r.city.toLowerCase().includes(search.toLowerCase()) ||
        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
      return matchCity && matchCuisine && matchSearch
    })
  }, [selectedCity, selectedCuisine, search])

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
        </div>
      </header>

      <main className="main">
        <section className="hero">
          <p className="hero-count">
            <strong>{filtered.length}</strong> adresse{filtered.length !== 1 ? 's' : ''} sélectionnée{filtered.length !== 1 ? 's' : ''} par les meilleurs influenceurs
          </p>
        </section>

        <div className="filters">
          <div className="filter-group">
            <label className="filter-label">Ville</label>
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
          <div className="filter-group">
            <label className="filter-label">Cuisine</label>
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
        </div>

        {filtered.length === 0 ? (
          <div className="empty">
            <p>Aucun restaurant trouvé pour ces critères.</p>
            <button className="pill pill--active" onClick={() => {
              setSelectedCity('Toutes les villes')
              setSelectedCuisine('Toutes les cuisines')
              setSearch('')
            }}>Réinitialiser les filtres</button>
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
