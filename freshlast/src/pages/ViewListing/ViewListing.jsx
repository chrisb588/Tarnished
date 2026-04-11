import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getListingById } from '../../api/listings';
import { getProfile } from '../../api/profile';
import './ViewListing.css';

export default function ViewListing() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const data = await getListingById(id);
        setListing(data);
        if (data.merchant) {
          const merchantData = await getProfile(data.merchant);
          setMerchant(merchantData);
        }
      } catch (e) {
        console.error('Failed to fetch listing:', e);
        setError('Could not load this listing.');
      }
      setIsLoading(false);
    };
    fetchListing();
  }, [id]);

  return (
    <div className="view-listing">
        <button className="view-listing-back-btn" onClick={() => navigate(-1)}>
        ← Back
        </button>

        {isLoading && <p className="view-listing-status">Loading...</p>}
        {error && <p className="view-listing-status view-listing-status--error">{error}</p>}

      {listing && (
        <div className="view-listing-card">
            <div className="view-listing-image">
            {listing.image && <img src={listing.image} alt={listing.name} />}
            <p>test</p>
            </div>

            <div className="view-listing-info">
            <h1 className="view-listing-name">{listing.name} </h1>
            <div className="view-listing-add-info">
              <p className="view-listing-type">Type{listing.type}</p>
              <p className="view-listing-info-sep">-</p>
              <p className="view-listing-quantity">{listing.quantity} {listing.unit}</p>
            </div>
            <div className="view-listing-prices">
                <span className="view-listing-original-price">₱{listing.original_price}</span>
                <span className="view-listing-price-sep">|</span>
                <span className="view-listing-discounted-price">₱{listing.discounted_price}</span>
                <span className="view-listing-quantity">/ {listing.unit}</span>
            </div>

            </div>

            <div className="view-listing-info">
                {/*TO DO: CLICKING ON THE MERCHANT'S NAME TAKES U TO THEIR PROFILE */}
                <h1 className="merchant-label">{merchant ? merchant.name : `${listing.merchant}`}</h1>
                <p className="stall-photo-label">Stall Photo:</p>
                <div className="merchant-stall-image">
                {merchant?.location_photo && <img src={merchant.location_photo} alt="Stall" />}
                </div>
                <h1 className="merchant-label">Stall Location</h1>
                <div className="merchant-location">
                    INSERT GOOGLE MAPS HERE
                </div>
                

            </div>
        </div>
      )}
    </div>
  );
}
