import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import ListingItem from '../../components/ListingItem/ListingItem.jsx'
import { getAllListings } from '../../api/listings'
import { getProfile } from '../../api/profile'
import AppHeader from '../../components/AppHeader/AppHeader.jsx'
import './OfferList.css'

/* ---------- icons ---------- */
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
)
const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h7v7a9 9 0 0 1-9 9z" /><path d="M2 22 17 7" />
  </svg>
)
const TruckIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 3h15v13H1z" /><path d="M16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" />
  </svg>
)
const HeartIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
  </svg>
)
const FacebookIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>)
const TwitterIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z" /></svg>)
const InstagramIcon = () => (<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" /></svg>)

const CATEGORIES = ['All Produce', 'Vegetables', 'Fruits', 'Chicken', 'Pork', 'Beef', 'Seafood']
const PREVIEW_COUNT = 6

const SORT_OPTIONS = [
  { value: 'newest',        label: '↓ Newest First' },
  { value: 'oldest',        label: '↑ Oldest First' },
  { value: 'price-asc',     label: '$ Lowest Price' },
  { value: 'price-desc',    label: '$ Highest Price' },
  { value: 'discount-desc', label: '% Largest Discount' },
  { value: 'discount-asc',  label: '% Smallest Discount' },
]
const SORT_LABELS = Object.fromEntries(SORT_OPTIONS.map(o => [o.value, o.label]))

export default function OfferList({ session, onLogout, onLoginClick, isAdmin }) {
  const navigate = useNavigate()
  const [selectedCategory, setSelectedCategory] = useState('All Produce')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [stallName, setStallName] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [sortOpen, setSortOpen] = useState(false)
  const sortDropdownRef = useRef(null)

  useEffect(() => {
    (async () => {
      setIsLoading(true)
      try { setListings(await getAllListings() || []) }
      catch (e) { console.error(e) }
      setIsLoading(false)
    })()
  }, [])

  useEffect(() => {
    if (!session?.user?.id) return
    getProfile(session.user.id).then(data => {
      if (data?.name) setStallName(data.name)
    })
  }, [session])

  useEffect(() => {
    const handler = (e) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(e.target))
        setSortOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const filteredListings = useMemo(() => listings.filter((l) => {
    const cat = (l.category || l.type || '').toLowerCase()
    const sel = selectedCategory.toLowerCase()
    const matchCat = sel === 'all produce' || cat.includes(sel.replace(/s$/, ''))
    const matchSearch = (l.name || '').toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchSearch
  }), [listings, selectedCategory, searchQuery])

  const sortedListings = useMemo(() => [...filteredListings].sort((a, b) => {
    const priceA = (a.discounted_price > 0 && a.discounted_price < a.original_price) ? a.discounted_price : a.original_price
    const priceB = (b.discounted_price > 0 && b.discounted_price < b.original_price) ? b.discounted_price : b.original_price
    const discA = a.original_price > 0 && a.discounted_price > 0 && a.original_price > a.discounted_price
      ? (a.original_price - a.discounted_price) / a.original_price : 0
    const discB = b.original_price > 0 && b.discounted_price > 0 && b.original_price > b.discounted_price
      ? (b.original_price - b.discounted_price) / b.original_price : 0
    switch (sortBy) {
      case 'oldest':        return new Date(a.created_at) - new Date(b.created_at)
      case 'price-asc':     return priceA - priceB
      case 'price-desc':    return priceB - priceA
      case 'discount-desc': return discB - discA
      case 'discount-asc':  return discA - discB
      default:              return new Date(b.created_at) - new Date(a.created_at)
    }
  }), [filteredListings, sortBy])

  const spotlight = useMemo(() => [...listings]
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 3), [listings])
  const visible = showAll ? sortedListings : sortedListings.slice(0, PREVIEW_COUNT)

  const handleViewAll = () => {
    setShowAll(prev => !prev)
  }

  return (
    <div className="offerlist">
      <AppHeader
        session={session}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
      />

      {/* ── HERO ── */}
      {session ? (
        <section className="offerlist__hero offerlist__hero--dashboard">
          <div className="offerlist__hero-content">
            <span className="offerlist__hero-eyebrow">Vendor Dashboard</span>
            <h2 className="offerlist__hero-heading">Welcome back, {stallName || 'Merchant'}</h2>
            <p className="offerlist__hero-sub">Manage your stall and listings from here.</p>
            <div className="offerlist__hero-actions">
              <Link to="/create" className="offerlist__hero-btn offerlist__hero-btn--primary">+ Add New Listing</Link>
              <Link to="/dashboard" className="offerlist__hero-btn offerlist__hero-btn--secondary">View My Listings</Link>
            </div>
          </div>
        </section>
      ) : (
        <section className="offerlist__hero">
          <div className="offerlist__hero-content">
            <span className="offerlist__hero-eyebrow">Carbon Market • Daily Fresh</span>
            <h2 className="offerlist__hero-heading">Fresh from the vendors of Carbon Market.</h2>
            <p className="offerlist__hero-sub">Locally sourced produce, meat, and seafood.</p>
            <div className="offerlist__search-bar">
              <SearchIcon />
              <input
                type="text"
                className="offerlist__search-input"
                placeholder="Search carrots, seafood, organic beef…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </section>
      )}


      {/* ── SPOTLIGHT (calm, just 3) ── */}
      {spotlight.length > 0 && (
        <section className="offerlist__section">
          <div className="offerlist__container">
            <div className="offerlist__section-head">
              <h2 className="offerlist__title">Latest Deals</h2>
              <p className="offerlist__subtitle">The latest deals from our selection</p>
            </div>
            <div className="offerlist__grid offerlist__grid--3">
              {spotlight.map(l => (
                <ListingItem key={l.id} listing={l} showEdit={false} onSelect={(x) => navigate(`/viewListing/${x.id}`)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── BROWSE BY CATEGORY ── */}
      <section className="offerlist__section offerlist__section--alt" id="browse">
        <div className="offerlist__container">
          <div className="offerlist__section-head">
            <div>
              <h2 className="offerlist__title">Browse by Category</h2>
              <p className="offerlist__subtitle">
                {filteredListings.length} item{filteredListings.length === 1 ? '' : 's'} in {selectedCategory}
              </p>
            </div>
            <div className="sort-dropdown" ref={sortDropdownRef}>
              <button className="sort-btn" onClick={() => setSortOpen(o => !o)}>
                {SORT_LABELS[sortBy]} ▾
              </button>
              {sortOpen && (
                <div className="sort-dropdown__menu">
                  {SORT_OPTIONS.map(opt => (
                    <button
                      key={opt.value}
                      className={`sort-dropdown__option${sortBy === opt.value ? ' sort-dropdown__option--active' : ''}`}
                      onClick={() => { setSortBy(opt.value); setSortOpen(false) }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="offerlist__categories-inner">
            {CATEGORIES.map(c => (
              <button
                key={c}
                className={`offerlist__filter-btn ${selectedCategory === c ? 'offerlist__filter-btn--active' : ''}`}
                onClick={() => { setSelectedCategory(c); setShowAll(false) }}
              >
                {c}
              </button>
            ))}
          </div>

          {isLoading ? (
            <p className="offerlist__status">Loading listings…</p>
          ) : visible.length > 0 ? (
            <>
              <div className="offerlist__grid">
                {visible.map(l => (
                  <ListingItem key={l.id} listing={l} showEdit={false} onSelect={(x) => navigate(`/viewListing/${x.id}`)} />
                ))}
              </div>
              {sortedListings.length > PREVIEW_COUNT && (
                <div className="offerlist__view-all-wrap">
                  <button className="offerlist__view-all" onClick={handleViewAll}>
                    {showAll
                      ? 'Show Less ↑'
                      : `View All ${sortedListings.length} Items →`}
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="offerlist__status">No products found in this category.</p>
          )}
        </div>
      </section>


      {/* ── FOOTER ── */}
      <footer className="offerlist__footer">
        <div className="offerlist__container">
          <div className="offerlist__footer-top">
            <div>
              <h3 className="offerlist__footer-brand">FreshLast</h3>
              <p className="offerlist__footer-tagline">Group: Tarnished</p>
            </div>
          </div>
          <div className="offerlist__footer-bottom">
            <p>© 2025 FreshLast Marketplace. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
