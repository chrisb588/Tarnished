import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMerchants } from '../../api/profile';
import AppHeader from '../../components/AppHeader/AppHeader';
import VendorMap from '../../components/VendorMap/VendorMap';
import { useCart } from '../../contexts/CartContext';
import './CartMap.css';

const DEFAULT_LAT = 10.3157;
const DEFAULT_LNG = 123.8854;

function formatDays(operatingDays) {
  if (!operatingDays?.length) return null;
  return operatingDays.map((s) => s.day).join(' · ');
}

export default function CartMap({ session, onLogout, onLoginClick, isAdmin }) {
  const { cartItems, total } = useCart();
  const [merchants, setMerchants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocatedByGps, setUserLocatedByGps] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const cartMerchantIds = new Set(cartItems.map((item) => item.merchantId));
  const stopCount = merchants.length;

  useEffect(() => {
    let cancelled = false;

    getAllMerchants()
      .then((data) => {
        if (cancelled) return;
        const withCoords = (Array.isArray(data) ? data : []).filter(
          (m) =>
            cartMerchantIds.has(m.id) &&
            m.latitude &&
            m.longitude &&
            m.latitude !== 0 &&
            m.longitude !== 0
        );
        setMerchants(withCoords);
      })
      .finally(() => { if (!cancelled) setIsLoading(false); });

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (cancelled) return;
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setUserLocatedByGps(true);
        mapRef.current?.flyTo(coords.latitude, coords.longitude, 15);
      },
      () => {
        if (cancelled) return;
        setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setUserLocatedByGps(false);
      }
    );

    return () => { cancelled = true; };
  }, []);

  const effectiveLocation = userLocation ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG };

  const merchantCartItems = selectedMerchant
    ? cartItems.filter((item) => item.merchantId === selectedMerchant.id)
    : [];

  const stopSubtotal = merchantCartItems.reduce(
    (sum, item) => sum + item.quantity * item.discountedPrice,
    0
  );

  if (cartItems.length === 0 || (!isLoading && merchants.length === 0)) {
    return (
      <div className="cart-map-page">
        <AppHeader session={session} onLogout={onLogout} onLoginClick={onLoginClick} isAdmin={isAdmin} />
        <div className="cart-map-page__empty">
          <span className="cart-map-page__empty-icon">🗺️</span>
          <p className="cart-map-page__empty-text">No stops yet</p>
          <p className="cart-map-page__empty-sub">Add items to your cart to see merchants on the map</p>
          <button className="cart-map-page__browse-btn" onClick={() => navigate('/')}>
            ← Browse Listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-map-page">
      <AppHeader session={session} onLogout={onLogout} onLoginClick={onLoginClick} isAdmin={isAdmin} />

      <div className="cart-map-page__topbar">
        <button className="cart-map-page__back" onClick={() => navigate(-1)}>
          ← Back
        </button>
        <span className="cart-map-page__summary">
          {stopCount} {stopCount === 1 ? 'stop' : 'stops'} · ₱{total.toFixed(0)} total
        </span>
      </div>

      <div className="cart-map-page__body">
        <div className="cart-map-page__map">
          {isLoading ? (
            <div className="cart-map-page__loading">Loading map...</div>
          ) : (
            <VendorMap
              ref={mapRef}
              merchants={merchants}
              userLocation={effectiveLocation}
              showUserLocationPin={userLocatedByGps}
              selectedMerchantId={selectedMerchant?.id ?? null}
              onPinClick={(merchant) => {
                setSelectedMerchant(merchant);
                mapRef.current?.flyTo(merchant.latitude, merchant.longitude, 17);
              }}
            />
          )}
        </div>

        {selectedMerchant && (
          <div className="cart-map-page__overlay" onClick={() => setSelectedMerchant(null)} />
        )}

        <div className={`cart-map-page__drawer${selectedMerchant ? ' cart-map-page__drawer--visible' : ''}`}>
          {selectedMerchant && (
            <>
              <div className="cart-map-page__drawer-handle" />
              <button
                className="cart-map-page__drawer-close"
                onClick={() => setSelectedMerchant(null)}
                aria-label="Close"
              >
                ×
              </button>

              <div className="cart-map-page__drawer-name">{selectedMerchant.name}</div>

              {formatDays(selectedMerchant.operating_days) && (
                <div className="cart-map-page__drawer-hours">
                  {formatDays(selectedMerchant.operating_days)}
                </div>
              )}

              <div className="cart-map-page__drawer-section-label">Your items from here</div>
              <div className="cart-map-page__drawer-items">
                {merchantCartItems.map((item) => (
                  <div key={item.listingId} className="cart-map-page__drawer-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span className="cart-map-page__drawer-item-price">
                      ₱{(item.discountedPrice * item.quantity).toFixed(0)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-map-page__drawer-subtotal">
                Stop subtotal: <strong>₱{stopSubtotal.toFixed(0)}</strong>
              </div>

              <button
                className="cart-map-page__drawer-store-btn"
                onClick={() => navigate(`/merchant/${selectedMerchant.id}`)}
              >
                View Store →
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
