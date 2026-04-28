import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useParams } from 'react-router-dom'
import ListingItem from '../../components/ListingItem/ListingItem.jsx'
import MerchantInfo from '../../components/MerchantInfo/MerchantInfo.jsx'
import CategoryFilter from '../../components/CategoryFilter/CategoryFilter.jsx'
import './ViewMerchant.css'
import { supabase } from '../../lib/supabaseClient.jsx'
import { getProfile} from "../../api/profile";
import { getListingsByMerchant } from '../../api/listings';


function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  )
}


export default function ViewMerchant() {
  const navigate = useNavigate()
  const { id: paramId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [listings, setListings] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const [merchantData, setMerchantData] = useState(
    {
      id: "",
      stallName: "",
      marketLocation: "",
      phoneNumber: "",
      //to do: this becomes an array
      operatingHoursStart: "",
      operatingHoursEnd: "",
      operatingDays: [],
      category: [],
    }
  )

  useEffect(() => 
  {
    const fetchProfile = async () => {
      if(!supabase) return
      let userId = paramId;
      if (!userId) {
        const
        {
          data: {user},
        } = await supabase.auth.getUser();
        if (!user) { setError("User details cannot be retrieved"); return; }
        userId = user.id;
      }

      const data = await getProfile(userId);

      if (data) {
        setMerchantData({
          id: data.id || "",
          stallName: data.name || "",
          marketLocation: data.location || "",
          phoneNumber: data.phone_number || "",
          operatingHoursStart: data.start_operating_time || "",
          operatingHoursEnd: data.end_operating_time || "",
          operatingDays: data.operating_days || [],
          category: data.category || [],
          location_photo: data.location_photo || "",
          coords: data.latitude && data.longitude 
          ? { lat: data.latitude, lng: data.longitude } 
          : null,
        });
      }
      setIsLoading(false)
    }
    fetchProfile();
  }, [paramId]
)

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true)
      try {
        let merchantId = paramId
        if (!merchantId)
        {
          const { data: { user } } = await supabase.auth.getUser()
          if (!user) return
          merchantId = user.id
        }
          
          const data = await getListingsByMerchant(merchantId)
          setListings(data)
        }
      catch (e) {
        console.error('Failed to fetch listings:', e)
      }
      setIsLoading(false)
    }
    fetchListings()
  }, [paramId])


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
      </header>


      <div className='view-merchant-container'>
        <button className="viewmerchant-backbtn" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <main className="viewmerchant-content">
          <div className='viewmerchant-info'>
              <MerchantInfo
                formData ={merchantData}
              />
          </div>

          <div className="viewmerchant-listings"> 
            <div className="viewmerchant-categories">
              {/*TO DO: Make these clickable/filterable*/}
              <CategoryFilter name="Vegetables" />
              <CategoryFilter name="Chicken" />
              <CategoryFilter name="Seafood" />
            </div>
              {isLoading ? (
              <p className="viewmerchant-status">Loading listings...</p>
              ) : filteredListings.length > 0 ? (
              <div className="viewmerchant-grid">
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
              <p className="viewmerchant-status">No products found</p>
              )}
          </div>
        </main>
      </div>
    </div>
  )
}