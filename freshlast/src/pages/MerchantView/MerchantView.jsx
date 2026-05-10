import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

function StarIcon({ size = 16, fill = "currentColor", color = "currentColor" }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}
import { getProfile } from '../../api/profile'
import { getListingsByMerchant } from '../../api/listings'
import './MerchantView.css'

export default function MerchantView() {
    const { id } = useParams()
    const navigate = useNavigate()

    const [merchant, setMerchant] = useState(null)
    const [products, setProducts] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchMerchantData = async () => {
            setIsLoading(true)
            try {
                const [profileRes, listingsRes] = await Promise.all([
                    getProfile(id).catch(() => null),
                    getListingsByMerchant(id).catch(() => [])
                ])

                if (profileRes && profileRes.data) {
                    setMerchant(profileRes.data)
                } else {
                    setError("Merchant not found.")
                }

                // Handle products
                if (Array.isArray(listingsRes)) {
                    setProducts(listingsRes)
                } else if (listingsRes && listingsRes.data) {
                    setProducts(listingsRes.data)
                }
            } catch (err) {
                console.error("Failed to load merchant:", err)
                setError("Failed to load merchant profile.")
            }
            setIsLoading(false)
        }

        if (id) {
            fetchMerchantData()
        }
    }, [id])

    if (isLoading) {
        return (
            <div className="merchantview">
                <main className="merchantview__main" style={{ textAlign: 'center', padding: '4rem' }}>
                    Loading merchant profile...
                </main>
            </div>
        )
    }

    if (error || !merchant) {
        return (
            <div className="merchantview">
                <main className="merchantview__main" style={{ textAlign: 'center', padding: '4rem' }}>
                    {error || 'Merchant not found.'}
                    <br /><br />
                    <button className="merchantview__secondary-btn" onClick={() => navigate(-1)}>Go Back</button>
                </main>
            </div>
        )
    }

    // Hardcoded reviews for visual presentation as requested by design (DB does not support reviews yet)
    const reviews = [
        {
            name: 'Sarah J.',
            tag: 'Verified Buyer',
            time: '2 days ago',
            text: 'The heirloom tomatoes are absolutely incredible. Delivery was fast and eco-friendly.',
        },
        {
            name: 'Michael R.',
            tag: 'Verified Buyer',
            time: '1 week ago',
            text: 'Best sweet corn in the valley. FreshLast made ordering so easy.',
        },
    ]

    return (
        <div className="merchantview">

            {/* HEADER */}
            <header className="merchantview__header">
                <h1 className="merchantview__logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
                    FreshLast
                </h1>

                <nav className="merchantview__nav">
                    <a className="merchantview__nav-link merchantview__nav-link--active" onClick={() => navigate('/offers')}>
                        Browse Marketplace
                    </a>

                    <a className="merchantview__nav-link">
                        How it Works
                    </a>
                </nav>

                <div className="merchantview__icons">
                    <button className="merchantview__icon-btn">🛒</button>
                    <button className="merchantview__icon-btn" onClick={() => navigate('/dashboard')}>👤</button>
                </div>
            </header>

            {/* HERO */}
            <section className="merchantview__hero">
                <div className="merchantview__hero-overlay" />

                <div className="merchantview__hero-content">
                    <h2 className="merchantview__hero-title">
                        {merchant.name || 'Unnamed Farm'}
                    </h2>

                    <p className="merchantview__hero-subtitle">
                        {merchant.location ? `Located in ${merchant.location}` : 'Fresh produce grown sustainably'}
                    </p>
                </div>
            </section>

            {/* MAIN */}
            <main className="merchantview__main">

                {/* MERCHANT CARD */}
                <section className="merchantview__merchant-card">

                    <div className="merchantview__avatar">
                        {merchant.location_photo ? (
                            <img src={merchant.location_photo} alt={merchant.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            (merchant.name || 'F')[0].toUpperCase()
                        )}
                    </div>

                    <div>

                        <div className="merchantview__merchant-info">
                            <h3 className="merchantview__merchant-name">
                                {merchant.name || 'Unnamed Farm'}
                            </h3>

                            <div className="merchantview__merchant-meta">
                                <span>📍 {merchant.location || 'Location not specified'}</span>

                                <div className="merchantview__rating">
                                    <StarIcon size={16} fill="#f59e0b" color="#f59e0b" />
                                    <span>4.9 (120 reviews)</span>
                                </div>
                            </div>
                        </div>

                        <div className="merchantview__story">
                            <h4 className="merchantview__section-title">
                                Our Story
                            </h4>

                            <p className="merchantview__story-text">
                                Welcome to {merchant.name}! We pride ourselves on providing the freshest produce straight to your table.
                                {merchant.start_operating_time && ` We are open from ${merchant.start_operating_time} to ${merchant.end_operating_time}.`}
                            </p>

                            <div className="merchantview__tags">
                                <span className="merchantview__tag">Fresh</span>
                                <span className="merchantview__tag">Local</span>
                                <span className="merchantview__tag">Quality</span>
                            </div>

                            <div className="merchantview__buttons">
                                <button className="merchantview__primary-btn" onClick={() => window.location.href = `tel:${merchant.phone_number || ''}`}>
                                    Contact Seller
                                </button>

                                <button className="merchantview__secondary-btn">
                                    Follow Farm
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* PRODUCTS */}
                <section className="merchantview__section">
                    <h3 className="merchantview__section-title">
                        Featured Products
                    </h3>

                    {products.length > 0 ? (
                        <div className="merchantview__grid">
                            {products.map((product, index) => (
                                <div key={index} className="merchantview__product-card" onClick={() => navigate(`/viewListing/${product.id}`)} style={{ cursor: 'pointer' }}>

                                    <img
                                        src={product.image || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?q=80&w=1200&auto=format&fit=crop"}
                                        alt={product.name}
                                        className="merchantview__product-image"
                                    />

                                    <div className="merchantview__product-content">
                                        <h4 className="merchantview__product-title">
                                            {product.name}
                                        </h4>

                                        <p className="merchantview__product-price">
                                            ₱{product.discounted_price || product.original_price} / {product.unit}
                                        </p>

                                        <button className="merchantview__cart-btn" onClick={(e) => {
                                            e.stopPropagation()
                                            // Cart functionality not yet implemented
                                            alert("Added to cart!")
                                        }}>
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p style={{ color: '#6b7280' }}>This vendor hasn't posted any products yet.</p>
                    )}
                </section>

                {/* REVIEWS */}
                <section className="merchantview__section">
                    <div className="merchantview__reviews-header">
                        <h3 className="merchantview__section-title">
                            Customer Feedback
                        </h3>

                        <div className="merchantview__rating">
                            <StarIcon size={18} fill="#f59e0b" color="#f59e0b" />
                            <span>4.9 Rating</span>
                        </div>
                    </div>

                    <div className="merchantview__reviews">
                        {reviews.map((review, index) => (
                            <div key={index} className="merchantview__review">

                                <div className="merchantview__review-top">
                                    <div className="merchantview__review-avatar">
                                        👤
                                    </div>

                                    <div>
                                        <h4 className="merchantview__review-name">
                                            {review.name}
                                        </h4>

                                        <p className="merchantview__review-meta">
                                            {review.tag} • {review.time}
                                        </p>
                                    </div>
                                </div>

                                <p className="merchantview__review-text">
                                    "{review.text}"
                                </p>
                            </div>
                        ))}
                    </div>
                </section>

            </main>

            {/* FOOTER */}
            <footer className="merchantview__footer">
                <p>
                    © 2024 FreshLast Marketplace. All rights reserved.
                </p>
            </footer>

        </div>
    )
}
