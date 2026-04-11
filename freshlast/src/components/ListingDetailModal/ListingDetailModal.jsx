import { useEffect } from 'react';
import './ListingDetailModal.css'
import { FaXmark } from "react-icons/fa6";

export default function ListingDetailModal({ listing, onClose, detailIsOpen }) {

  useEffect(() => {
    if (detailIsOpen) {
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
    }
    return () => {
      if (document.body.style.position === 'fixed') {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      }
    };
  }, [detailIsOpen]);

  if (!detailIsOpen) return null;

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