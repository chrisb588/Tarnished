import AuthForm from "../AuthForm/AuthForm";

import './AuthModal.css'

export default function AuthModal({ isOpen, onClose}) {


  if (!isOpen) return null; // Don't render anything if closed

  return (
    <div className="modal-overlay">
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-button"
        >
          X
        </button>

        {/* Pass the mode down to the form */}
        <AuthForm/>
      </div>
    </div>
  );
}