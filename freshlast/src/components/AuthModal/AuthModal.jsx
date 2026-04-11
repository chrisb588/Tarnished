import { useEffect } from 'react';
import AuthForm from "../AuthForm/AuthForm";
import { FaXmark } from "react-icons/fa6";

import './AuthModal.css'

export default function AuthModal({ isOpen, onClose, onSuccess }) {

  useEffect(() => {
    if (isOpen) {
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
  }, [isOpen]);

  if (!isOpen) return null;

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