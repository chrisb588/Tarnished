import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { IoLogOut } from 'react-icons/io5';
import { useCart } from '../../contexts/CartContext';
import './AppHeader.css';

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);

const CartIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" />
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
  </svg>
);

function AppLogo() {
  return (
    <svg width="22" height="22" viewBox="0 0 68 70" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20.1219 14.3695C1.66476 25.8641 7.13956 54.8004 12.1926 69.102H43.4434C43.4434 63.3041 41.1113 57.5061 30.8498 50.3167C26.1855 47.0488 25.0194 41.0897 28.9841 36.8655C32.2491 33.3867 38.0795 33.3867 42.0442 36.8655L66.765 20.3993C59.7685 11.8184 38.579 2.87479 20.1219 14.3695Z" fill="white" stroke="white" />
      <path d="M0.765015 3.23743L2.63074 5.78853C2.63074 11.3545 0.765015 18.544 6.82862 24.3419C11.265 15.4544 16.265 10.9544 26.1855 7.87578C23.2003 1.56763 14.5247 2.15515 10.5601 3.23743C12.1926 5.78853 8.81095 6.94811 6.82862 5.78853C4.84629 4.62894 5.42932 1.38209 6.82862 0.454422L0.765015 3.23743Z" fill="white" stroke="white" />
      <path d="M60.935 46.8376L47.1753 69.3337C48.1079 58.6657 39.9455 51.4759 32.2495 46.8376H60.935ZM47.4077 48.9255C45.6048 48.9257 44.1433 50.3787 44.143 52.1716C44.143 53.9646 45.6047 55.4184 47.4077 55.4186C49.2109 55.4186 50.6733 53.9647 50.6733 52.1716C50.673 50.3786 49.2107 48.9255 47.4077 48.9255Z" fill="white" />
    </svg>
  );
}

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

function isExpired(expiresAt) {
  if (!expiresAt) return false;
  return new Date(expiresAt) < new Date();
}

function CartDropdown({ onClose }) {
  const [confirmClear, setConfirmClear] = useState(false);
  const { cartItems, total, updateQuantity, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="cart-dropdown__empty">
        <span className="cart-dropdown__empty-icon">🛒</span>
        <p className="cart-dropdown__empty-text">Your cart is empty</p>
        <p className="cart-dropdown__empty-sub">Browse listings to start planning your trip</p>
      </div>
    );
  }

  const groups = Object.values(
    cartItems.reduce((acc, item) => {
      if (!acc[item.merchantId]) {
        acc[item.merchantId] = { merchantId: item.merchantId, merchantName: item.merchantName, items: [] };
      }
      acc[item.merchantId].items.push(item);
      return acc;
    }, {})
  );

  return (
    <div className="cart-dropdown__content">
      <div className="cart-dropdown__groups">
        {groups.map((group) => {
          const groupSubtotal = group.items.reduce(
            (sum, item) => sum + item.quantity * item.discountedPrice,
            0
          );
          return (
            <div key={group.merchantId} className="cart-dropdown__group">
              <div className="cart-dropdown__group-name">{group.merchantName}</div>
              {group.items.map((item) => {
                const expired = isExpired(item.expiresAt);
                const warned = item.isSoldOut || expired;
                return (
                  <div key={item.listingId} className={`cart-dropdown__item${warned ? ' cart-dropdown__item--warned' : ''}`}>
                    <div className="cart-dropdown__item-thumb">
                      {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} />
                        : <span>🥬</span>
                      }
                    </div>
                    <div className="cart-dropdown__item-info">
                      <div className="cart-dropdown__item-name">
                        {item.name}
                        {item.isSoldOut && <span className="cart-dropdown__badge cart-dropdown__badge--soldout">Sold out</span>}
                        {!item.isSoldOut && expired && <span className="cart-dropdown__badge cart-dropdown__badge--expired">Expired</span>}
                      </div>
                      <div className="cart-dropdown__item-price">
                        ₱{item.discountedPrice} × {item.quantity} = <strong>₱{(item.discountedPrice * item.quantity).toFixed(0)}</strong>
                      </div>
                      {warned && <div className="cart-dropdown__item-warn">may no longer be available</div>}
                    </div>
                    <div className="cart-dropdown__item-stepper">
                      <button
                        className="cart-dropdown__stepper-btn"
                        onClick={() => {
                          if (item.quantity === 1) removeFromCart(item.listingId);
                          else updateQuantity(item.listingId, item.quantity - 1);
                        }}
                      >−</button>
                      <span>{item.quantity}</span>
                      <button
                        className="cart-dropdown__stepper-btn"
                        onClick={() => updateQuantity(item.listingId, item.quantity + 1)}
                      >+</button>
                    </div>
                    <button
                      className="cart-dropdown__remove"
                      aria-label={`Remove ${item.name}`}
                      onClick={() => removeFromCart(item.listingId)}
                    >
                      ×
                    </button>
                  </div>
                );
              })}
              <div className="cart-dropdown__subtotal">
                Subtotal: <strong>₱{groupSubtotal.toFixed(0)}</strong>
              </div>
            </div>
          );
        })}
      </div>

      <div className="cart-dropdown__footer">
        <div className="cart-dropdown__total">
          <span>Total</span>
          <strong>₱{total.toFixed(0)}</strong>
        </div>
        <div className="cart-dropdown__footer-actions">
          <button
            className="cart-dropdown__map-btn"
            onClick={() => { onClose(); navigate('/cart-map'); }}
          >
            🗺 View on Map
          </button>
          {confirmClear ? (
            <div className="cart-dropdown__confirm">
              <span className="cart-dropdown__confirm-text">Clear cart?</span>
              <button
                className="cart-dropdown__confirm-yes"
                onClick={() => { clearCart(); setConfirmClear(false); }}
              >
                Yes
              </button>
              <button
                className="cart-dropdown__confirm-no"
                onClick={() => setConfirmClear(false)}
              >
                No
              </button>
            </div>
          ) : (
            <button
              className="cart-dropdown__clear-btn"
              onClick={() => setConfirmClear(true)}
            >
              Clear
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function AppHeader({
  session,
  onLogout,
  onLoginClick,
  searchQuery,
  onSearchChange,
  isAdmin,
}) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');
  const { itemCount } = useCart();
  const [showCart, setShowCart] = useState(false);
  const cartRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setShowCart(false);
      }
    }
    if (showCart) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showCart]);

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {/* Brand */}
        <Link to="/" className="app-header__brand">
          <span className="app-header__brand-icon"><AppLogo size={22} /></span>
          <span className="app-header__brand-name">
            <span className="app-header__brand-color-primary">Fresh</span>
            <span className="app-header__brand-color-secondary">Last</span>
          </span>
        </Link>

        {/* Actions */}
        <div className="app-header__actions">
          {onSearchChange && (
            <div className="app-header__search">
              <SearchIcon />
              <input
                type="text"
                className="app-header__search-input"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="app-header__search-clear"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <Link to="/map" className="app-header__nav-link">Vendor Map</Link>

          {isAdmin && (
            <Link to="/admin" className="app-header__nav-link">Admin Dashboard</Link>
          )}

          {/* Cart */}
          <div ref={cartRef} className="app-header__cart">
            <button
              className="app-header__icon-btn app-header__cart-btn"
              onClick={() => setShowCart((v) => !v)}
              aria-label="Cart"
            >
              <CartIcon />
              {itemCount > 0 && (
                <span className="app-header__cart-badge">{itemCount}</span>
              )}
            </button>

            {showCart && (
              <div className="cart-dropdown">
                <CartDropdown onClose={() => setShowCart(false)} />
              </div>
            )}
          </div>

          {session && onLogout ? (
            <>
              <nav className="app-header__nav">
                {session && (
                  <Link
                    to="/dashboard"
                    className={`app-header__nav-link${isDashboard ? ' app-header__nav-link--active' : ''}`}
                  >
                    My Listings
                  </Link>
                )}
              </nav>
              <nav className="app-header__cta">
                {session && <Link to="/create">Add New Listing</Link>}
              </nav>
              <Link
                to={`/merchant/${session?.user?.id ?? ''}`}
                className="app-header__icon-btn"
                title="My Profile"
                aria-label="View my merchant profile"
              >
                <UserIcon />
              </Link>
              <button
                className="app-header__icon-btn"
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
              >
                <IoLogOut />
              </button>
            </>
          ) : onLoginClick ? (
            <button className="app-header__cta" onClick={onLoginClick}>Log in to Sell</button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
