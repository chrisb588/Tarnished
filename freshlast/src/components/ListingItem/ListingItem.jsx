import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProfile } from '../../api/profile';
import './ListingItem.css'

export default function ListingItem({ listing, showEdit = false, onSelect }) {
  const navigate = useNavigate();
  const [merchantName, setMerchantName] = useState('');

  useEffect(() => {
    if (listing?.merchant_id) {
      getProfile(listing.merchant_id)
        .then(data => {
          if (data && data.name) {
            setMerchantName(data.name);
          }
        })
        .catch(err => console.error("Failed to fetch merchant:", err));
    }
  }, [listing?.merchant_id]);

  return (
    <div className="listing-border" onClick={onSelect ? () => onSelect(listing) : undefined}>
      <div className="listing-image">
        {listing.image && <img src={listing.image} alt={listing.name} />}
      </div>
      <div className='listing-info'>
        <p>
          <span className='listing-name'>{listing.name}</span>
          <br />
          {merchantName && (
            <>
              <span className='merchant-name' style={{ fontSize: '0.85rem', color: '#6b7280', fontWeight: '500' }}>
                {merchantName}
              </span>
              <br />
            </>
          )}
          <span className='original-price'>₱{listing.original_price}</span>
          &nbsp;|&nbsp;
          <span className='discounted-price'>₱{listing.discounted_price}</span>
          <br />
          <span className='quantity'>{listing.quantity} {listing.unit}</span>
          <br />
          <span className='type'>Type: TO DO: INSERT TYPE INTO TABLE{listing.type}</span>
        </p>
      </div>
      {showEdit && (
        <button className="edit-button" onClick={(e) => { e.stopPropagation(); navigate(`/edit/${listing.id}`); }}>
          Edit
        </button>
      )}
    </div>
  );
}