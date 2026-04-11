import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import ListingItem from '../../components/ListingItem/ListingItem.jsx'
import AuthModal from '../../components/AuthModal/AuthModal.jsx'
import ListingDetailModal from '../../components/ListingDetailModal/ListingDetailModal.jsx'
import { getAllListings } from '../../api/listings'
import './OfferList.css'


function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  )
}

function FilterIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
    </svg>
  )
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Beef', 'Pork', 'Chicken', 'Seafood']

export default function OfferList({ session, onLogout }) {
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedListing, setSelectedListing] = useState(null)
  const [showListingModal, setShowListingModal] = useState(false)

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
    const matchesCategory = selectedCategory === 'All' || listing.category === selectedCategory
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="offerlist">
      <header className="offerlist__header">

        {/* Colored Logo */}
        <div className="offerlist__logo">
          <span className="offerlist__logo--green">Fr</span>
          <span className="offerlist__logo--orange">è</span>
          <span className="offerlist__logo--green">shL</span>
          <span className="offerlist__logo--orange">a</span>
          <span className="offerlist__logo--green">st</span>
        </div>

        <div className="offerlist__search">
          <input
            type="text"
            className="offerlist__search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button className="offerlist__search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </div>

        {session ? (
          <div className="offerlist__header-actions">
            <Link to="/dashboard" className="offerlist__login-btn">My Listings</Link>
            <button className="offerlist__login-btn" onClick={onLogout}>
              Log Out
            </button>
          </div>
        ) : (
          <button className="offerlist__login-btn" onClick={() => setShowLoginModal(true)}>
            Log in to Sell
          </button>
        )}
      </header>

      <main className="offerlist__content">
        <div className="offerlist__filters">
          <div className="offerlist__dropdown">
            <button className="offerlist__filter-btn" onClick={() => setShowFilters(!showFilters)}>
              <FilterIcon /> Filters
            </button>
            {showFilters && (
              <div className="offerlist__dropdown-content">
                {CATEGORIES.map(category => (
                  <button
                    key={category}
                    className={`offerlist__dropdown-item ${selectedCategory === category ? 'offerlist__dropdown-item--active' : ''}`}
                    onClick={() => { setSelectedCategory(category); setShowFilters(false) }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <h2 className="offerlist__title">OFFERS:</h2>

        {isLoading ? (
          <p className="offerlist__status">Loading listings...</p>
        ) : filteredListings.length > 0 ? (
          <div className="offerlist__grid">
            {filteredListings.map(listing => (
              <ListingItem 
              key={listing.id} 
              listing={listing} 
              showEdit={false} 
              onSelect={(listing) => 
                {
                  setShowListingModal(true)
                  setSelectedListing(listing)
                }
              }
              />
            ))}
          </div>
        ) : (
          <p className="offerlist__status">No products found</p>
        )}

        <ListingDetailModal
          detailIsOpen={showListingModal}
          listing={selectedListing}
          onClose={() => 
            {
              setSelectedListing(null)
              setShowListingModal(false)
            }
          }
        />        
      </main>

      <AuthModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} onSuccess={() => setShowLoginModal(false)} />
    </div>
  )
}