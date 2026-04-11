import './ListingDetailModal.css'
import { FaXmark } from "react-icons/fa6";

export default function ListingDetailModal({ listing, onClose, detailIsOpen }) {


  if (!detailIsOpen) return null; // Don't render anything if closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="listing-modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-button"
        >
        <FaXmark></FaXmark>
        </button>

        <div className='listing-wrapper'>
            <div className="detail-listing-image">
            {listing.image && <img src={listing.image} alt={listing.name} />}
            </div>
            <div className='detail-listing-info'>
                <p>
                <span className='detail-listing-name'>{listing.name}</span>
                <br />
                <span className='detail-original-price'>₱{listing.original_price}</span>
                &nbsp;|&nbsp;
                <span className='detail-discounted-price'>₱{listing.discounted_price}</span>
                <br />
                <span className='detail-quantity'>{listing.quantity} {listing.unit}</span>
                <br />
                <span className='detail-type'>TO DO: ADD LISTING TYPE{listing.type}</span>
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}