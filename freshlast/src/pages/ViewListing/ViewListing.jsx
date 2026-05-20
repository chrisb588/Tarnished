import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { getListingById } from "../../api/listings";
import { getProfile } from "../../api/profile";
import { supabase } from "../../lib/supabaseClient";
import AppHeader from "../../components/AppHeader/AppHeader.jsx";
import "./ViewListing.css";
import { useLanguage } from "../../context/languageContext.jsx";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function ViewListing({
  session,
  onLogout,
  onLoginClick,
  isAdmin,
}) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [merchant, setMerchant] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    const fetchListing = async () => {
      setIsLoading(true);
      try {
        const data = await getListingById(id);
        setListing(data);
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user && data.merchant_id === user.id) setIsOwner(true);
        if (data.merchant_id) {
          const profile = await getProfile(data.merchant_id);
          setMerchant(profile?.data || profile);
        }
      } catch (e) {
        console.error("Failed to fetch listing:", e);
        setError(t("vl_error"));
      }
      setIsLoading(false);
    };
    fetchListing();
  }, [id]);

  if (isLoading)
    return (
      <div className="vl-container">
        <AppHeader
          session={session}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          isAdmin={isAdmin}
        />
        <p className="vl-status">Loading...</p>
      </div>
    );

  if (error || !listing)
    return (
      <div className="vl-container">
        <AppHeader
          session={session}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          isAdmin={isAdmin}
        />
        <p className="vl-status vl-status--error">
          {error || t("vl_not_found")}
        </p>
        <div style={{ textAlign: "center" }}>
          <button className="vl-back__btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString("en-PH", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const originalPrice = Number(listing.original_price);
  const discountedPrice = Number(listing.discounted_price);
  const hasDiscount =
    Number.isFinite(originalPrice) &&
    originalPrice > 0 &&
    Number.isFinite(discountedPrice) &&
    discountedPrice > 0 &&
    originalPrice > discountedPrice;

  return (
    <div className="vl-container">
      <AppHeader
        session={session}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        isAdmin={isAdmin}
      />

      {/* ── BREADCRUMB ── */}
      <div className="vl-breadcrumb">
        <span className="vl-breadcrumb__link" onClick={() => navigate("/")}>
          HOME
        </span>
        {" › "}
        <span className="vl-breadcrumb__link" onClick={() => navigate("/")}>
          {listing.category?.toUpperCase() || t("vl_produce")}
        </span>
        {" › "}
        <span>{listing.name?.toUpperCase()}</span>
      </div>

      <main className="vl-main">
        <div className="vl-content">
          {/* ── LEFT: Image ── */}
          <div className="vl-images">
            <div className="vl-images__main">
              {listing.image ? (
                <img
                  src={listing.image}
                  alt={listing.name}
                  className="vl-images__main-img"
                />
              ) : (
                <div className="vl-images__placeholder">📷</div>
              )}
            </div>
          </div>

          {/* ── RIGHT: Info ── */}
          <div className="vl-info">
            <div className="vl-info__header">
              <span className="vl-info__badge">
                PRODUCE • {listing.category?.toUpperCase() || t("vl_general")}
              </span>
              <h1 className="vl-info__name">{listing.name}</h1>
              <div className="vl-info__price-row">
                {hasDiscount ? (
                  <>
                    <span className="vl-info__original-price">
                      ₱{listing.original_price}
                    </span>
                    <span className="vl-info__price">
                      ₱{listing.discounted_price}
                    </span>
                  </>
                ) : (
                  listing.original_price != null &&
                  listing.original_price !== "" && (
                    <span className="vl-info__price">
                      ₱{listing.original_price}
                    </span>
                  )
                )}
                {listing.unit && (
                  <span className="vl-info__unit">/ {listing.unit}</span>
                )}
              </div>
            </div>

            <div className="vl-info__cards">
              <div className="vl-info__card">
                <span className="vl-info__card-label">{t("vl_quantity")}</span>
                <span className="vl-info__card-value">
                  {listing.quantity != null
                    ? `${listing.quantity} ${listing.unit || ""}`
                    : "—"}
                </span>
              </div>
              <div className="vl-info__card">
                <span className="vl-info__card-label">{t("vl_type")}</span>
                <span className="vl-info__card-value">
                  {listing.type || listing.category || "—"}
                </span>
              </div>
              {formatDate(listing.created_at) && (
                <div className="vl-info__card">
                  <span className="vl-info__card-label">
                    {t("vl_listed_on")}
                  </span>
                  <span className="vl-info__card-value">
                    {formatDate(listing.created_at)}
                  </span>
                </div>
              )}
            </div>

            {listing.description && (
              <div className="vl-info__section">
                <h3 className="vl-info__section-title">
                  {t("product_details")}
                </h3>
                <p className="vl-info__description">{listing.description}</p>
              </div>
            )}

            {isOwner && (
              <button
                className="vl-info__edit-btn"
                onClick={() => navigate(`/edit/${id}`)}
              >
                {t("vl_edit_listing")}
              </button>
            )}

            {/* ── Seller Card ── */}
            {merchant && (
              <div className="vl-seller">
                <div className="vl-seller__header">
                  <div className="vl-seller__avatar">
                    {merchant.location_photo ? (
                      <img src={merchant.location_photo} alt={merchant.name} />
                    ) : (
                      merchant.name?.[0]?.toUpperCase() || "?"
                    )}
                  </div>
                  <div className="vl-seller__info">
                    <div className="vl-seller__name">
                      {merchant.name || "Vendor"}
                    </div>
                    {merchant.location && (
                      <div className="vl-seller__location">
                        📍 {merchant.location}
                      </div>
                    )}
                  </div>
                  <button
                    className="vl-seller__view-btn"
                    onClick={() =>
                      navigate(`/viewMerchant/${listing.merchant_id}`)
                    }
                  >
                    {t("vl_view_merchant")}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── MERCHANT DETAILS ── */}
        {merchant && (
          <div className="vl-merchant-details">
            {merchant.location_photo && (
              <div className="vl-merchant-details__section">
                <h3 className="vl-merchant-details__label">
                  {t("stall_photo")}
                </h3>
                <div className="vl-merchant-details__stall-img">
                  <img src={merchant.location_photo} alt="Stall" />
                </div>
              </div>
            )}

            <div className="vl-merchant-details__section">
              <h3 className="vl-merchant-details__label">
                {t("vl_stall_location")}
              </h3>
              <div className="vl-merchant-details__map">
                {merchant.latitude &&
                merchant.longitude &&
                merchant.latitude !== 0 &&
                merchant.longitude !== 0 ? (
                  <MapContainer
                    center={[merchant.latitude, merchant.longitude]}
                    zoom={17}
                    style={{ width: "100%", height: "100%" }}
                    attributionControl={true}
                    dragging={false}
                    scrollWheelZoom={false}
                    doubleClickZoom={false}
                    zoomControl={false}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="© OpenStreetMap contributors"
                    />
                    <Marker
                      position={[merchant.latitude, merchant.longitude]}
                      icon={markerIcon}
                    />
                  </MapContainer>
                ) : (
                  <p className="vl-status">{t("location_not_set")}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ── BACK ── */}
        <div className="vl-back">
          <button className="vl-back__btn" onClick={() => navigate(-1)}>
            ← Back to Marketplace
          </button>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="vl-footer">
        <div className="vl-footer__inner">
          <div>
            <div className="vl-footer__brand">FreshLast</div>
            <p className="vl-footer__tagline">Fresh from Carbon Market.</p>
          </div>
          <div className="vl-footer__links">
            <a href="#">About Us</a>
            <a href="#">Contact</a>
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
          </div>
        </div>
        <div className="vl-footer__bottom">
          © 2024 FreshLast Marketplace. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
