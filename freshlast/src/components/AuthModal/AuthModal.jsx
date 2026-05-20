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

function AppLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 68 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.1219 14.3695C1.66476 25.8641 7.13956 54.8004 12.1926 69.102H43.4434C43.4434 63.3041 41.1113 57.5061 30.8498 50.3167C26.1855 47.0488 25.0194 41.0897 28.9841 36.8655C32.2491 33.3867 38.0795 33.3867 42.0442 36.8655L66.765 20.3993C59.7685 11.8184 38.579 2.87479 20.1219 14.3695Z" fill="white" stroke="white" />
      <path d="M0.765015 3.23743L2.63074 5.78853C2.63074 11.3545 0.765015 18.544 6.82862 24.3419C11.265 15.4544 16.265 10.9544 26.1855 7.87578C23.2003 1.56763 14.5247 2.15515 10.5601 3.23743C12.1926 5.78853 8.81095 6.94811 6.82862 5.78853C4.84629 4.62894 5.42932 1.38209 6.82862 0.454422L0.765015 3.23743Z" fill="white" stroke="white" />
      <path d="M60.935 46.8376L47.1753 69.3337C48.1079 58.6657 39.9455 51.4759 32.2495 46.8376H60.935ZM47.4077 48.9255C45.6048 48.9257 44.1433 50.3787 44.143 52.1716C44.143 53.9646 45.6047 55.4184 47.4077 55.4186C49.2109 55.4186 50.6733 53.9647 50.6733 52.1716C50.673 50.3786 49.2107 48.9255 47.4077 48.9255Z" fill="white" />
    </svg>
  );
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
          <div className="app-header__brand" style={{ justifyContent: 'center', marginBottom: '16px', display: 'inline-flex' }}>
            <span className="app-header__brand-icon"><AppLogo /></span>
            <span className="app-header__brand-name">
              <span className="app-header__brand-color-primary">Fresh</span>
              <span className="app-header__brand-color-secondary">Last</span>
            </span>
          </div>
          <h2 className="auth-modal__title">Vendor Login</h2>
          <p className="auth-modal__subtitle">Manage your harvest and connect with customers.</p>
        </div>

        <AuthForm onSuccess={onSuccess} onClose={onClose} />
      </div>
    </div>
  );
}
