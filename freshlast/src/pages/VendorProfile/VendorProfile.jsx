import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import ListingItem from '@/components/ListingItem/ListingItem.jsx'
import { supabase } from '@/lib/supabaseClient'
import { getProfile } from '@/api/profile'
import './VendorProfile.css'

function BackArrowIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 12H5M12 19l-7-7 7-7"/>
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  )
}

export default function VendorProfile({ params }) {
  const navigate = useNavigate()
  const [vendorId] = useState(params?.vendorId || null)

  const [vendor, setVendor] = useState(null)
  const [vendorProducts, setVendorProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchVendorData = async () => {
      if (!supabase) return

      setIsLoading(true)
      setError('')

      try {
        // Resolve the vendor ID — use param if provided, else fall back to logged-in user
        let userId = vendorId
        if (!userId) {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) {
            setError('Vendor not found')
            setIsLoading(false)
            return
          }
          userId = user.id
        }

        // Fetch vendor profile using the same helper as EditProfile
        const response = await getProfile(userId)
        const data = response.data

        if (!data) {
          setError('Vendor not found')
          setIsLoading(false)
          return
        }

        setVendor({
          id: data.id,
          stallName: data.name || '',
          marketLocation: data.location || '',
          phoneNumber: data.phone_number || '',
          operatingHoursStart: data.start_operating_time || '',
          operatingHoursEnd: data.end_operating_time || '',
          operatingDays: data.operating_days || [],
          locationPhoto: data.location_photo || null,
        })

        // Fetch vendor's products from Supabase
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('vendor_id', userId)

        if (productsError) {
          console.error('Error fetching products:', productsError)
        } else {
          setVendorProducts(products || [])
        }
      } catch (e) {
        setError('Failed to load vendor profile')
        console.error(e)
      } finally {
        setIsLoading(false)
      }
    }

    fetchVendorData()
  }, [vendorId])

  if (isLoading) {
    return (
      <div className="vendor-profile">
        <div className="vendor-profile__header">
          <button className="vendor-profile__back-btn" onClick={() => navigate(-1)}>
            <BackArrowIcon />
            Back
          </button>
        </div>
        <div className="vendor-profile__card" style={{ margin: '1.5rem' }}>
          <p className="vendor-profile__empty-text">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !vendor) {
    return (
      <div className="vendor-profile">
        <div className="vendor-profile__header">
          <button className="vendor-profile__back-btn" onClick={() => navigate(-1)}>
            <BackArrowIcon />
            Back
          </button>
        </div>
        <div className="vendor-profile__card" style={{ margin: '1.5rem' }}>
          <p className="vendor-profile__empty-text">{error || 'Vendor not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="vendor-profile">
      {/* Header with back button */}
      <div className="vendor-profile__header">
        <button className="vendor-profile__back-btn" onClick={() => navigate(-1)}>
          <BackArrowIcon />
          Back
        </button>
      </div>

      {/* Main content */}
      <div className="vendor-profile__body">
        {/* Vendor Information Card */}
        <div className="vendor-profile__card">
          <h1 className="vendor-profile__stall-name">{vendor.stallName}</h1>

          <div className="vendor-profile__info">
            {/* Left column - Basic Info */}
            <div className="vendor-profile__details">
              <div className="vendor-profile__detail-group">
                <span className="vendor-profile__detail-label">Location</span>
                <span className="vendor-profile__detail-value">{vendor.marketLocation}</span>
              </div>

              <div className="vendor-profile__detail-group">
                <span className="vendor-profile__detail-label">Operating Hours</span>
                <div className="vendor-profile__operating-hours">
                  <div className="vendor-profile__hours-item">
                    <div className="vendor-profile__hours-label">From</div>
                    <div className="vendor-profile__hours-value">{vendor.operatingHoursStart}</div>
                  </div>
                  <div className="vendor-profile__hours-item">
                    <div className="vendor-profile__hours-label">To</div>
                    <div className="vendor-profile__hours-value">{vendor.operatingHoursEnd}</div>
                  </div>
                </div>
              </div>

              <div className="vendor-profile__detail-group">
                <span className="vendor-profile__detail-label">Operating Days</span>
                <div className="vendor-profile__operating-days">
                  {vendor.operatingDays.map(day => (
                    <span key={day} className="vendor-profile__day-badge">{day}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right column - Contact */}
            <div>
              <div className="vendor-profile__contact-section">
                <h3 className="vendor-profile__contact-title">Contact Information</h3>
                <div className="vendor-profile__contact-info">
                  <PhoneIcon />
                  <a href={`tel:${vendor.phoneNumber}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                    {vendor.phoneNumber}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Listings Section */}
        <div className="vendor-profile__listings-section">
          <h2 className="vendor-profile__listings-title">Products</h2>

          {vendorProducts.length > 0 ? (
            <div className="vendor-profile__listings-grid">
              {vendorProducts.map(product => (
                <ListingItem key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="vendor-profile__card">
              <div className="vendor-profile__empty">
                <p className="vendor-profile__empty-text">No products available</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}