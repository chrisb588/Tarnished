import { useNavigate } from 'react-router-dom';
import './ListingItem.css'

function getExpiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt) - new Date();
  if (diffMs <= 0) return null;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours <= 24) return `Expires in ${hours}h`;
  const days = Math.ceil(hours / 24);
  return `Expires in ${days}d`;
}

export default function ListingItem({ listing, showEdit = false, onSelect, onSoldOut }) {
  const navigate = useNavigate();
  const expiryLabel = getExpiryLabel(listing.expires_at);
  const isSoldOut = listing.is_sold_out;

  return (
    <div
      className={`listing-border${isSoldOut ? ' listing-border--sold-out' : ''}`}
      onClick={onSelect ? () => onSelect(listing) : undefined}
    >
      <div className="listing-image">
        {listing.image && <img src={listing.image} alt={listing.name} />}
      </div>
      <div className='listing-info'>
        <p>
          <span className='listing-name'>{listing.name}</span>
          <br />
          <span className='original-price'>₱{listing.original_price}</span>
          &nbsp;|&nbsp;
          <span className='discounted-price'>₱{listing.discounted_price}</span>
          <br />
          <span className='quantity'>{listing.quantity} {listing.unit}</span>
          <br />
          <span className='type'>Type: {listing.type}</span>
          {expiryLabel && (
            <>
              <br />
              <span className='expiry-label'>{expiryLabel}</span>
            </>
          )}
          {isSoldOut && (
            <>
              <br />
              <span className='sold-out-label'>Sold Out</span>
            </>
          )}
        </p>
      </div>
      {showEdit && (
        <div className="listing-actions">
          <button
            className="edit-button"
            onClick={(e) => { e.stopPropagation(); navigate(`/edit/${listing.id}`); }}
          >
            Edit
          </button>
          {onSoldOut && (
            <button
              className="sold-out-button"
              onClick={(e) => { e.stopPropagation(); onSoldOut(listing); }}
            >
              Sold Out
            </button>
          )}
        </div>
      )}
    </div>
  );
}
