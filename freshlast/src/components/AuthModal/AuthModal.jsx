import { useEffect } from 'react';
import AuthForm from "../AuthForm/AuthForm";
import './AuthModal.css'

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18" /><path d="m6 6 12 12" />
    </svg>
  )
}

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
    <div className="auth-modal__overlay" onClick={onClose}>
      <div className="auth-modal__card" onClick={(e) => e.stopPropagation()}>

        <button className="auth-modal__close" onClick={onClose}>
          <XIcon />
        </button>

        <div className="auth-modal__header">
          <div className="auth-modal__brand">FreshLast</div>
          <h2 className="auth-modal__title">Vendor Login</h2>
          <p className="auth-modal__subtitle">Manage your harvest and connect with customers.</p>
        </div>

        <AuthForm onSuccess={onSuccess} />
      </div>
    </div>
  );
}