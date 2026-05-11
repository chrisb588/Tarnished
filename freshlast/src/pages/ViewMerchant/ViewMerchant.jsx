import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import ListingItem from '../../components/ListingItem/ListingItem.jsx'
import AppHeader from '../../components/AppHeader/AppHeader.jsx'
import './ViewMerchant.css'
import { supabase } from '../../lib/supabaseClient.jsx'
import { getProfile } from '../../api/profile'
import { getListingsByMerchant } from '../../api/listings'

function StarIcon({ size = 16, fill = 'currentColor', color = 'currentColor' }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

const CATEGORIES = ['All', 'Vegetables', 'Fruits', 'Chicken', 'Pork', 'Beef', 'Seafood']

const reviews = [
  { name: 'Sarah J.', tag: 'Verified Buyer', time: '2 days ago', text: 'The heirloom tomatoes are absolutely incredible. Delivery was fast and eco-friendly.' },
  { name: 'Michael R.', tag: 'Verified Buyer', time: '1 week ago', text: 'Best sweet corn in the valley. FreshLast made ordering so easy.' },
]

export default function ViewMerchant({ session, onLogout, onLoginClick }) {
  const navigate = useNavigate()
  const { id: paramId } = useParams()
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [merchantData, setMerchantData] = useState(null)

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return
      let userId = paramId
      if (!userId) {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) { setError('User details cannot be retrieved'); return }
        userId = user.id
      }
      const data = await getProfile(userId)
      if (data) {
        setMerchantData({
          id: data.id || '',
          stallName: data.name || '',
          marketLocation: data.location || '',
          phoneNumber: data.phone_number || '',
          operatingHoursStart: data.start_operating_time || '',
          operatingHoursEnd: data.end_operating_time || '',
          operatingDays: data.operating_days || [],
          category: data.category || [],
          location_photo: data.location_photo || '',
          coords: data.latitude && data.longitude ? { lat: data.latitude, lng: data.longitude } : null,
        })
      } else {
        setError('Merchant not found.')
      }
    }
    fetchProfile()
  }, [paramId])

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        let merchantId = paramId
        if (!merchantId) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          merchantId = user.id
        }
        const data = await getListingsByMerchant(merchantId)
        setListings(data || [])
      } catch (e) {
        console.error('Failed to fetch listings:', e)
      }
      setIsLoading(false)
    }
    fetchListings()
  }, [paramId])

  const filteredListings = listings.filter(listing => {
    const matchesCategory = selectedCategory === 'All' || listing.type === selectedCategory
    const matchesSearch = listing.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  if (isLoading) return (
    <div className="vm-container">
      <AppHeader session={session} onLogout={onLogout} onLoginClick={onLoginClick} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <p className="vm-status">Loading merchant profile...</p>
    </div>
  )

  if (error || !merchantData) return (
    <div className="vm-container">
      <AppHeader session={session} onLogout={onLogout} onLoginClick={onLoginClick} searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <p className="vm-status vm-status--error">{error || 'Merchant not found.'}</p>
      <div style={{ textAlign: 'center' }}>
        <button className="vm-secondary-btn" onClick={() => navigate(-1)}>← Go Back</button>
      </div>
    </div>
  )

  return (
    <div className="vm-container">

      <AppHeader
        session={session}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* ── HERO ── */}
      <section className="vm-hero">
        <div className="vm-hero__content">
          <h2 className="vm-hero__title">{merchantData.stallName || 'Unnamed Stall'}</h2>
          <p className="vm-hero__subtitle">
            {merchantData.marketLocation
              ? `Located in ${merchantData.marketLocation}`
              : 'Fresh produce grown sustainably'}
          </p>
        </div>
      </section>

      <main className="vm-main">

        {/* ── MERCHANT CARD ── */}
        <section className="vm-merchant-card">
          <div className="vm-merchant-card__avatar">
            {merchantData.location_photo
              ? <img src={merchantData.location_photo} alt={merchantData.stallName} />
              : (merchantData.stallName?.[0]?.toUpperCase() || '?')
            }
          </div>

          <div className="vm-merchant-card__body">
            <div>
              <h3 className="vm-merchant-card__name">{merchantData.stallName || 'Unnamed Stall'}</h3>
              <div className="vm-merchant-card__meta">
                {merchantData.marketLocation && (
                  <span>📍 {merchantData.marketLocation}</span>
                )}
                {merchantData.operatingHoursStart && (
                  <span>🕐 {merchantData.operatingHoursStart} – {merchantData.operatingHoursEnd}</span>
                )}
                {merchantData.phoneNumber && (
                  <span>📞 {merchantData.phoneNumber}</span>
                )}
                <div className="vm-merchant-card__rating">
                  <StarIcon size={16} fill="#f59e0b" color="#f59e0b" />
                  <span>4.9 (120 reviews)</span>
                </div>
              </div>
            </div>

            <p className="vm-merchant-card__story">
              Welcome to {merchantData.stallName}! We pride ourselves on providing the freshest produce straight to your table.
              {merchantData.operatingHoursStart && ` Open from ${merchantData.operatingHoursStart} to ${merchantData.operatingHoursEnd}.`}
            </p>

            <div className="vm-merchant-card__tags">
              <span className="vm-merchant-card__tag">Fresh</span>
              <span className="vm-merchant-card__tag">Local</span>
              <span className="vm-merchant-card__tag">Quality</span>
              {merchantData.category?.map((cat, i) => (
                <span key={i} className="vm-merchant-card__tag">{cat}</span>
              ))}
            </div>

            <div className="vm-merchant-card__buttons">
              {merchantData.phoneNumber && (
                <button
                  className="vm-primary-btn"
                  onClick={() => window.location.href = `tel:${merchantData.phoneNumber}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                  Contact Seller
                </button>
              )}
              <button className="vm-back-btn" onClick={() => navigate(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
                Back
              </button>
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="vm-section">
          <h3 className="vm-section__title">Featured Products</h3>

          {/* Category filters */}
          <div className="vm-filters">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                className={`vm-filter-btn ${selectedCategory === cat ? 'vm-filter-btn--active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="vm-search">
            <input
              type="text"
              className="vm-search__input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="vm-status">Loading listings...</p>
          ) : filteredListings.length > 0 ? (
            <div className="vm-grid">
              {filteredListings.map(listing => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  showEdit={false}
                  onSelect={(l) => navigate(`/viewListing/${l.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="vm-status">No products found.</p>
          )}
        </section>

        {/* ── REVIEWS ── */}
        <section className="vm-section">
          <div className="vm-reviews__header">
            <h3 className="vm-section__title">Customer Feedback</h3>
            <div className="vm-reviews__rating">
              <StarIcon size={18} fill="#f59e0b" color="#f59e0b" />
              <span>4.9 Rating</span>
            </div>
          </div>

          <div className="vm-reviews">
            {reviews.map((review, i) => (
              <div key={i} className="vm-review">
                <div className="vm-review__top">
                  <div className="vm-review__avatar">👤</div>
                  <div>
                    <h4 className="vm-review__name">{review.name}</h4>
                    <p className="vm-review__meta">{review.tag} • {review.time}</p>
                  </div>
                </div>
                <p className="vm-review__text">"{review.text}"</p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer className="vm-footer">
        <p>© 2024 FreshLast Marketplace. All rights reserved.</p>
      </footer>

    </div>
  )
}