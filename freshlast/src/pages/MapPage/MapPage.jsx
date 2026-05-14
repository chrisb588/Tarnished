import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAllMerchants } from '../../api/profile';
import AppHeader from '../../components/AppHeader/AppHeader';
import VendorMap from '../../components/VendorMap/VendorMap';
import './MapPage.css';

const DEFAULT_LAT = 10.3157;
const DEFAULT_LNG = 123.8854;

function haversineKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  const km = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

function formatDays(operatingDays) {
  if (!operatingDays?.length) return null;
  return operatingDays.map((s) => s.day).join(' · ');
}

export default function MapPage({ session, onLogout, onLoginClick, isAdmin }) {
  const [merchants, setMerchants] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [userLocatedByGps, setUserLocatedByGps] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMerchant, setSelectedMerchant] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const mapRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({ lat: coords.latitude, lng: coords.longitude });
        setUserLocatedByGps(true);
      },
      () => {
        setUserLocation({ lat: DEFAULT_LAT, lng: DEFAULT_LNG });
        setUserLocatedByGps(false);
      }
    );

    getAllMerchants()
      .then((data) => {
        const withCoords = (Array.isArray(data) ? data : []).filter(
          (m) => m.latitude && m.longitude && m.latitude !== 0 && m.longitude !== 0
        );
        setMerchants(withCoords);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const effectiveLocation = userLocation ?? { lat: DEFAULT_LAT, lng: DEFAULT_LNG };

  const dropdownResults =
    searchQuery.length >= 1
      ? merchants.filter((m) =>
          m.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : [];

  function handleDropdownSelect(merchant) {
    setSearchQuery('');
    setSelectedMerchant(merchant);
    mapRef.current?.flyTo(merchant.latitude, merchant.longitude, 17);
  }

  function dismissCard() {
    setSelectedMerchant(null);
  }

  return (
    <div className="map-page">
      <AppHeader
        session={session}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        isAdmin={isAdmin}
      />
      <div className="map-page__body">
        <div className="map-page__search-wrapper">
          <input
            className="map-page__search"
            type="text"
            placeholder="Search a store name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && setSearchQuery('')}
          />
          {dropdownResults.length > 0 && (
            <ul className="map-page__dropdown">
              {dropdownResults.map((m) => (
                <li key={m.id} onClick={() => handleDropdownSelect(m)}>
                  {m.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="map-page__map">
          {isLoading ? (
            <div className="map-page__loading">Loading map...</div>
          ) : (
            <VendorMap
              ref={mapRef}
              merchants={merchants}
              userLocation={effectiveLocation}
              showUserLocationPin={userLocatedByGps}
              selectedMerchantId={selectedMerchant?.id ?? null}
              onPinClick={setSelectedMerchant}
            />
          )}
        </div>

        {selectedMerchant && (
          <div className="map-page__overlay" onClick={dismissCard} />
        )}

        <div className={`map-page__card${selectedMerchant ? ' map-page__card--visible' : ''}`}>
          {selectedMerchant && (
            <>
              <div className="map-page__card-handle" />
              <button
                className="map-page__card-close"
                onClick={dismissCard}
                aria-label="Close"
              >
                ×
              </button>
              <div className="map-page__card-name">{selectedMerchant.name}</div>
              <div className="map-page__card-tags">
                {selectedMerchant.category?.map((c) => (
                  <span key={c} className="map-page__card-tag">{c}</span>
                ))}
                {formatDays(selectedMerchant.operating_days) && (
                  <span className="map-page__card-tag">
                    {formatDays(selectedMerchant.operating_days)}
                  </span>
                )}
                <span className="map-page__card-tag">
                  {haversineKm(
                    effectiveLocation.lat,
                    effectiveLocation.lng,
                    selectedMerchant.latitude,
                    selectedMerchant.longitude
                  )}
                </span>
              </div>
              <div>
                <h4 className="map-page__card-photo-title">
                  Stall Photo:
                </h4>
              </div>
              <div className="map-page__card-photo">
                {selectedMerchant.location_photo ? (
                  <img
                    src={selectedMerchant.location_photo}
                    alt={`${selectedMerchant.name ?? 'Stall'} photo`}
                  />
                ) : (
                  <span className="map-page__card-photo-placeholder">
                    {selectedMerchant.name?.trim()?.charAt(0)?.toUpperCase() ?? '?'}
                  </span>
                )}
              </div>
              <button
                className="map-page__card-cta"
                onClick={() => navigate(`/merchant/${selectedMerchant.id}`)}
              >
                View Store
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
