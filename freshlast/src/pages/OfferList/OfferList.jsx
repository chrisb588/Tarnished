import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import ListingItem from '../../components/ListingItem/ListingItem.jsx'
import AuthModal from '../../components/AuthModal/AuthModal.jsx'
import { getAllListings } from '../../api/listings'
import './OfferList.css'

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  )
}

function MapIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function TruckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3" />
      <rect x="9" y="11" width="14" height="10" rx="2" />
      <circle cx="12" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    </svg>
  )
}

function GiftIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 12 20 22 4 22 4 12" />
      <rect x="2" y="7" width="20" height="5" />
      <line x1="12" y1="22" x2="12" y2="7" />
      <path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" />
      <path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  )
}

const CATEGORIES = ['All Produce', 'Vegetables', 'Fruits', 'Chicken', 'Pork', 'Beef', 'Seafood']

export default function OfferList({ session, onLogout }) {
  const navigate = useNavigate()
  const heroSearchRef = useRef(null)
  const headerSearchRef = useRef(null)
  const [showHeaderSearch, setShowHeaderSearch] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All Produce')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        const data = await getAllListings()
        setListings(data || [])
      } catch (e) {
        console.error('Failed to fetch listings:', e)
      }
      setIsLoading(false)
    }
    fetchListings()
  }, [])

  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategory === 'All Produce' || listing.category === selectedCategory
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="offerlist">

      {/* ── HEADER ── */}
      <header className="offerlist__header">
        <div className="offerlist__header-inner">
          <h1 className="offerlist__logo">FreshLast</h1>

          <nav className="offerlist__nav">
            <a href="#listings" className="offerlist__nav-link">Browse Marketplace</a>
          </nav>

          <div className="offerlist__header-actions">
            <div className="offerlist__header-search">
              <SearchIcon />
              <input
                ref={headerSearchRef}
                type="text"
                className="offerlist__header-search-input"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {session ? (
              <>
                <button className="offerlist__icon-btn" onClick={onLogout} title="Log Out">
                  <UserIcon />
                </button>
                <Link to="/dashboard" className="offerlist__cta-btn">My Listings</Link>
              </>
            ) : (
              <>
                <button className="offerlist__icon-btn" onClick={() => setShowLoginModal(true)} title="Profile">
                  <UserIcon />
                </button>
                <button className="offerlist__cta-btn" onClick={() => setShowLoginModal(true)}>
                  Log in to Sell
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── HERO ── */}
      <section className="offerlist__hero">
        <div className="offerlist__hero-content">
          <h2 className="offerlist__hero-heading">
            Fresh from the vendors<br />of Carbon Market.
          </h2>
        </div>
      </section>

      {/* ── SEARCH BAR (below hero) ── */}
      <div className="offerlist__search-bar-wrap">
        <div className="offerlist__search-bar">
          <span className="offerlist__search-icon"><SearchIcon /></span>
          <input
            ref={heroSearchRef}
            type="text"
            className="offerlist__search-input"
            placeholder="Search for carrots, seafood, or organic beef..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ── CATEGORY PILLS ── */}
      <div className="offerlist__categories">
        <div className="offerlist__categories-inner">
          {CATEGORIES.map(category => (
            <button
              key={category}
              className={`offerlist__filter-btn ${selectedCategory === category ? 'offerlist__filter-btn--active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* ── LISTINGS GRID ── */}
      <section className="offerlist__listings" id="listings">
        <div className="offerlist__container">
          <div className="offerlist__listings-header">
            <div>
              <h2 className="offerlist__title">Fresh Listings</h2>
              <p className="offerlist__subtitle">Hand-picked by local vendors near you</p>
            </div>
            <a href="#" className="offerlist__view-all">View All →</a>
          </div>

          {isLoading ? (
            <p className="offerlist__status">Loading listings...</p>
          ) : filteredListings.length > 0 ? (
            <div className="offerlist__grid">
              {filteredListings.map(listing => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  showEdit={false}
                  onSelect={(listing) => navigate(`/viewListing/${listing.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="offerlist__status">No products found</p>
          )}
        </div>
      </section>

      {/* ── FEATURE SECTIONS ── */}
      <section className="offerlist__features">
        <div className="offerlist__container">
          <div className="offerlist__features-grid">

            <div className="offerlist__farmers-card">
              <div className="offerlist__farmers-overlay" />
              <div className="offerlist__farmers-content">
                <h3 className="offerlist__farmers-title">Meet our 2024 Top Quality Farmers</h3>
                <p className="offerlist__farmers-text">
                  Discover the stories behind your food and supporting the local agricultural community.
                </p>
                <button className="offerlist__stories-btn">Read Stories</button>
              </div>
            </div>


          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="offerlist__footer">
        <div className="offerlist__container">
          <div className="offerlist__footer-top">
            <div>
              <h3 className="offerlist__footer-brand">FreshLast</h3>
              <p className="offerlist__footer-tagline">Fresh from the farm, to your doorstep.</p>
            </div>
            <div className="offerlist__footer-links-group">
              <a href="#">About Us</a>
              <a href="#">Contact</a>
              <a href="#">Privacy Policy</a>
              <a href="#">Terms of Service</a>
            </div>
            <div className="offerlist__footer-socials">
              <a href="#"><FacebookIcon /></a>
              <a href="#"><TwitterIcon /></a>
              <a href="#"><InstagramIcon /></a>
            </div>
          </div>
          <div className="offerlist__footer-bottom">
            <p>© 2024 FreshLast Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <AuthModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={() => setShowLoginModal(false)}
      />
    </div>
  )
}