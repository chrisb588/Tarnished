import AuthForm from "../AuthForm/AuthForm";
import { FaXmark } from "react-icons/fa6";

import './AuthModal.css'

export default function AuthModal({ isOpen, onClose, onSuccess }) {


  if (!isOpen) return null; // Don't render anything if closed

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={onClose}
          className="close-button"
        >
        <FaXmark/>
        </button>

        {/* Pass the mode down to the form */}
        <AuthForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}