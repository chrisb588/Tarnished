import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMerchants } from '../../api/profile';
import AppHeader from '../../components/AppHeader/AppHeader';
import VendorMap from '../../components/VendorMap/VendorMap';
import { useCart } from '../../contexts/CartContext';
import './CartMap.css';

const DEFAULT_LAT = 10.3157;
const DEFAULT_LNG = 123.8854;

const GEO_OPTIONS = { timeout: 8000, maximumAge: 60000 };

function formatDays(operatingDays) {
  if (!operatingDays?.length) return null;
  return operatingDays.map((s) => s.day).join(' · ');
}

export default function CartMap({ session, onLogout, onLoginClick, isAdmin }) {
  const { cartItems, total } = useCart();
  const [allMerchants, setAllMerchants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocatedByGps, setUserLocatedByGps] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  const cartMerchantIds = useMemo(
    () => new Set(cartItems.map((item) => item.merchantId)),
    [cartItems]
  );

  const merchants = useMemo(
    () =>
      allMerchants.filter(
        (m) =>
          cartMerchantIds.has(m.id) &&
          m.latitude &&
          m.longitude &&
          m.latitude !== 0 &&
          m.longitude !== 0
      ),
    [allMerchants, cartMerchantIds]
  );

  const stopCount = merchants.length;

  useEffect(() => {
    let cancelled = false;

    getAllMerchants()
      .then((data) => {
        if (cancelled) return;
        setAllMerchants(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error('CartMap: failed to fetch merchants', err);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    if (!navigator.geolocation) {
      setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
      setUserLocatedByGps(false);
    } else {
      navigator.geolocation.getCurrentPosition(
        ({ coords }) => {
          if (cancelled) return;
          setUserLocation({ lat: coords.latitude, lng: coords.longitude });
          setUserLocatedByGps(true);
        },
        () => {
          if (cancelled) return;
          setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
          setUserLocatedByGps(false);
        },
        GEO_OPTIONS
      );
    }

    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (userLocatedByGps && userLocation && mapRef.current && !isLoading) {
      mapRef.current.flyTo(userLocation.lat, userLocation.lng, 15);
    }
  }, [userLocatedByGps, userLocation, isLoading]);

  const effectiveLocation = userLocation ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG };

  const merchantCartItems = useMemo(
    () => (selectedMerchant ? cartItems.filter((item) => item.merchantId === selectedMerchant.id) : []),
    [selectedMerchant, cartItems]
  );

  const stopSubtotal = useMemo(
    () => merchantCartItems.reduce((sum, item) => sum + item.quantity * item.discountedPrice, 0),
    [merchantCartItems]
  );

  if (cartItems.length === 0) {
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

  if (!isLoading && merchants.length === 0) {
    return (
      <div className="cart-map-page">
        <AppHeader session={session} onLogout={onLogout} onLoginClick={onLoginClick} isAdmin={isAdmin} />
        <div className="cart-map-page__empty">
          <span className="cart-map-page__empty-icon">🗺️</span>
          <p className="cart-map-page__empty-text">No stops on the map</p>
          <p className="cart-map-page__empty-sub">None of your cart merchants have a mapped location yet</p>
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
          {stopCount} {stopCount === 1 ? 'stop' : 'stops'} · ₱{total.toFixed(0)}
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
          {selectedMerchant && (() => {
            const formattedDays = formatDays(selectedMerchant.operating_days);
            return (
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

                {formattedDays && (
                  <div className="cart-map-page__drawer-hours">{formattedDays}</div>
                )}

                <div className="cart-map-page__drawer-section-label">Your items from here</div>
                <div className="cart-map-page__drawer-items">
                  {merchantCartItems.map((item) => (
                    <div key={item.listingId} className="cart-map-page__drawer-item">
                      <span>{item.name} × {item.quantity} — ₱{(item.discountedPrice * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="cart-map-page__drawer-subtotal">
                  Stop subtotal: <strong>₱{stopSubtotal.toFixed(0)}</strong>
                </div>

                <button
                  className="cart-map-page__drawer-store-btn"
                  onClick={() => navigate(`/viewMerchant/${selectedMerchant.id}`)}
                >
                  View Store →
                </button>
              </>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
