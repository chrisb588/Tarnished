import { useNavigate } from 'react-router-dom';
import './ListingItem.css'

export default function ListingItem({ listing, showEdit = false, onSelect }) {
  const navigate = useNavigate();

  return (
    <div className="listing-border" onClick={onSelect ? () => onSelect(listing) : undefined}>
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
        </p>
      </div>
      {showEdit && (
        <button className="edit-button" onClick={() => navigate(`/edit/${listing.id}`)}>
          Edit
        </button>
      )}
    </div>
  );
}