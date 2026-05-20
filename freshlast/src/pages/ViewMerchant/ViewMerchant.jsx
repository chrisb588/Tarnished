import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListingItem from "../../components/ListingItem/ListingItem.jsx";
import AppHeader from "../../components/AppHeader/AppHeader.jsx";
import "./ViewMerchant.css";
import { supabase } from "../../lib/supabaseClient.jsx";
import { getProfile } from "../../api/profile";
import { getListingsByMerchant } from "../../api/listings";
import VendorMap from "../../components/VendorMap/VendorMap.jsx";

function StarIcon({
  size = 16,
  fill = "currentColor",
  color = "currentColor",
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill}
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

const CATEGORIES = [
  "All",
  "Vegetables",
  "Fruits",
  "Chicken",
  "Pork",
  "Beef",
  "Seafood",
  "Rice",
];

const CATEGORY_TO_TYPE = {
  Vegetables: "vegetable",
  Fruits: "fruit",
  Chicken: "chicken",
  Pork: "pork",
  Beef: "beef",
  Seafood: "seafood",
  Rice: "rice",
};

const SORT_OPTIONS = [
  { value: "newest", label: "↓ Newest First" },
  { value: "oldest", label: "↑ Oldest First" },
  { value: "price-asc", label: "$ Lowest Price" },
  { value: "price-desc", label: "$ Highest Price" },
  { value: "discount-desc", label: "% Largest Discount" },
  { value: "discount-asc", label: "% Smallest Discount" },
];
const SORT_LABELS = Object.fromEntries(
  SORT_OPTIONS.map((o) => [o.value, o.label]),
);

const DAYS_ORDERED = [
  { short: "Mon", label: "Monday" },
  { short: "Tue", label: "Tuesday" },
  { short: "Wed", label: "Wednesday" },
  { short: "Thu", label: "Thursday" },
  { short: "Fri", label: "Friday" },
  { short: "Sat", label: "Saturday" },
  { short: "Sun", label: "Sunday" },
];

function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h < 12 ? "AM" : "PM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")}${period}`;
}

export default function ViewMerchant({
  session,
  onLogout,
  onLoginClick,
  isAdmin,
}) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [merchantData, setMerchantData] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;
      let userId = paramId;
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          setError("User details cannot be retrieved");
          return;
        }
        userId = user.id;
      }
      const data = await getProfile(userId);
      if (data) {
        setMerchantData({
          id: data.id || "",
          stallName: data.name || "",
          marketLocation: data.location || "",
          phoneNumber: data.phone_number || "",
          operatingHoursStart: data.start_operating_time || "",
          operatingHoursEnd: data.end_operating_time || "",
          operatingDays: data.operating_days || [],
          category: data.category || [],
          location_photo: data.location_photo || "",
          coords:
            data.latitude && data.longitude && Number(data.latitude) !== 0 && Number(data.longitude) !== 0
              ? { lat: Number(data.latitude), lng: Number(data.longitude) }
              : null,
        });
      } else {
        setError("Merchant not found.");
      }
    };
    fetchProfile();
  }, [paramId]);

  useEffect(() => {
    const fetchListings = async () => {
      setIsLoading(true);
      try {
        let merchantId = paramId;
        if (!merchantId) {
          const {
            data: { user },
          } = await supabase.auth.getUser();
          if (!user) return;
          merchantId = user.id;
        }
        const data = await getListingsByMerchant(merchantId);
        setListings(data || []);
      } catch (e) {
        console.error("Failed to fetch listings:", e);
      }
      setIsLoading(false);
    };
    fetchListings();
  }, [paramId]);

  useEffect(() => {
    const handler = (e) => {
      if (
        sortDropdownRef.current &&
        !sortDropdownRef.current.contains(e.target)
      )
        setSortOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      selectedCategory === "All" ||
      listing.type === CATEGORY_TO_TYPE[selectedCategory];
    const matchesSearch = listing.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    const priceA =
      a.discounted_price > 0 && a.discounted_price < a.original_price
        ? a.discounted_price
        : a.original_price;
    const priceB =
      b.discounted_price > 0 && b.discounted_price < b.original_price
        ? b.discounted_price
        : b.original_price;
    const discA =
      a.original_price > 0 &&
      a.discounted_price > 0 &&
      a.original_price > a.discounted_price
        ? (a.original_price - a.discounted_price) / a.original_price
        : 0;
    const discB =
      b.original_price > 0 &&
      b.discounted_price > 0 &&
      b.original_price > b.discounted_price
        ? (b.original_price - b.discounted_price) / b.original_price
        : 0;
    switch (sortBy) {
      case "oldest":
        return new Date(a.created_at) - new Date(b.created_at);
      case "price-asc":
        return priceA - priceB;
      case "price-desc":
        return priceB - priceA;
      case "discount-desc":
        return discB - discA;
      case "discount-asc":
        return discA - discB;
      default:
        return new Date(b.created_at) - new Date(a.created_at);
    }
  });

  const isOwner = !!session?.user && session.user.id === merchantData?.id;

  if (isLoading)
    return (
      <div className="vm-container">
        <AppHeader
          session={session}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={isAdmin}
        />
        <p className="vm-status">Loading merchant profile...</p>
      </div>
    );

  if (error || !merchantData)
    return (
      <div className="vm-container">
        <AppHeader
          session={session}
          onLogout={onLogout}
          onLoginClick={onLoginClick}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          isAdmin={isAdmin}
        />
        <p className="vm-status vm-status--error">
          {error || "Merchant not found."}
        </p>
        <div style={{ textAlign: "center" }}>
          <button className="vm-secondary-btn" onClick={() => navigate(-1)}>
            ← Go Back
          </button>
        </div>
      </div>
    );

  return (
    <div className="vm-container">
      <AppHeader
        session={session}
        onLogout={onLogout}
        onLoginClick={onLoginClick}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
      />

      {/* ── HERO ── */}
      <section className="vm-hero">
        <div className="vm-hero__content">
          <h2 className="vm-hero__title">
            {merchantData.stallName || "Unnamed Stall"}
          </h2>
          <p className="vm-hero__subtitle">
            {merchantData.marketLocation
              ? `Located in ${merchantData.marketLocation}`
              : "Fresh produce grown sustainably"}
          </p>
        </div>
      </section>

      <main className="vm-main">
        {/* ── MERCHANT CARD ── */}
        <section className="vm-merchant-card">
          <div className="vm-merchant-card__avatar">
            {merchantData.location_photo ? (
              <img
                src={merchantData.location_photo}
                alt={merchantData.stallName}
              />
            ) : (
              merchantData.stallName?.[0]?.toUpperCase() || "?"
            )}
          </div>

          <div className="vm-merchant-card__body">
            <h3 className="vm-merchant-card__name">
              {merchantData.stallName || "Unnamed Stall"}
            </h3>
            <div className="vm-merchant-card__info">
              <div className="vm-merchant-card__tag-details">
                <div className="vm-merchant-card__tags">
                  {merchantData.category?.map((cat, i) => (
                    <span key={i} className="vm-merchant-card__tag">
                      {cat}
                    </span>
                  ))}
                </div>
                <div className="vm-merchant-card__meta">
                  {merchantData.marketLocation && (
                    <span>📍 {merchantData.marketLocation}</span>
                  )}
                  {merchantData.phoneNumber && (
                    <span>📞 {merchantData.phoneNumber}</span>
                  )}
                </div>
              </div>
              <div className="schedule-box">
                <h4 className="schedule-title">Schedule:</h4>
                <div className="schedule-overview">
                  <div className="schedule-container">
                    {DAYS_ORDERED.slice(0, 4).map(({ short, label }) => {
                      const entry = merchantData.operatingDays?.find(
                        (d) => d.day === short,
                      );
                      return (
                        <>
                          <p key={short + "-label"}>{label}:</p>
                          <p key={short + "-val"}>
                            {entry
                              ? `${formatTime(entry.start_time)}-${formatTime(entry.end_time)}`
                              : "CLOSED"}
                          </p>
                        </>
                      );
                    })}
                  </div>
                  <div className="schedule-container">
                    {DAYS_ORDERED.slice(4).map(({ short, label }) => {
                      const entry = merchantData.operatingDays?.find(
                        (d) => d.day === short,
                      );
                      return (
                        <>
                          <p key={short + "-label"}>{label}:</p>
                          <p key={short + "-val"}>
                            {entry
                              ? `${formatTime(entry.start_time)}-${formatTime(entry.end_time)}`
                              : "CLOSED"}
                          </p>
                        </>
                      );
                    })}
                  </div>
                </div>
              </div>

              {merchantData.coords && (
                <div className="vm-merchant-map-box">
                  <h4 className="schedule-title">Stall Location:</h4>
                  <div className="vm-merchant-map">
                    <VendorMap
                      merchants={[{
                        id: merchantData.id,
                        name: merchantData.stallName || "Unnamed Stall",
                        latitude: merchantData.coords.lat,
                        longitude: merchantData.coords.lng,
                        category: merchantData.category,
                      }]}
                      userLocation={merchantData.coords}
                      showUserLocationPin={false}
                      selectedMerchantId={merchantData.id}
                      onPinClick={() => {}}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="vm-merchant-card__buttons">
              <button className="vm-back-btn" onClick={() => navigate(-1)}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="19" y1="12" x2="5" y2="12" />
                  <polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>
              {isOwner && (
                <button
                  className="vm-edit-profile-btn"
                  onClick={() => navigate("/profile")}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </section>

        {/* ── PRODUCTS ── */}
        <section className="vm-section">
          <div className="vm-section__header">
            <h3 className="vm-section__title">Featured Products</h3>
            <div className="sort-dropdown" ref={sortDropdownRef}>
              <button
                className="sort-btn"
                onClick={() => setSortOpen((o) => !o)}
              >
                {SORT_LABELS[sortBy]} ▾
              </button>
              {sortOpen && (
                <div className="sort-dropdown__menu">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      className={`sort-dropdown__option${sortBy === opt.value ? " sort-dropdown__option--active" : ""}`}
                      onClick={() => {
                        setSortBy(opt.value);
                        setSortOpen(false);
                      }}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Category filters */}
          <div className="vm-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`vm-filter-btn ${selectedCategory === cat ? "vm-filter-btn--active" : ""}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="vm-search">
            <input
              type="text"
              className="vm-search__input"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {isLoading ? (
            <p className="vm-status">Loading listings...</p>
          ) : sortedListings.length > 0 ? (
            <div className="vm-grid">
              {sortedListings.map((listing) => (
                <ListingItem
                  key={listing.id}
                  listing={listing}
                  showEdit={false}
                  onSelect={(l) => navigate(`/viewListing/${l.id}`)}
                />
              ))}
            </div>
          ) : (
            <p className="vm-status">No products found.</p>
          )}
        </section>
      </main>

      {/* ── FOOTER ── */}
      <footer className="vm-footer">
        <p>© 2025 FreshLast Marketplace. All rights reserved.</p>
      </footer>
    </div>
  );
}
