import './ListingDetailModal.css'

export default function ListingDetailModal({ listing, onClose, detailIsOpen }) {


  if (!detailIsOpen) return null; // Don't render anything if closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-button"
        >
          X
        </button>

        {/* Pass the mode down to the form */}
        <div><p>{listing.name}</p></div>
      </div>
    </div>
  );
}