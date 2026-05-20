import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ListingItem from "../../components/ListingItem/ListingItem";
import { supabase } from "../../lib/supabaseClient";
import { getListingsByMerchant, markAsSoldOut } from "../../api/listings";
import AppHeader from "../../components/AppHeader/AppHeader.jsx";
import "./Home.css";

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

export default function Home({ session, onLogout, isAdmin }) {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const sortDropdownRef = useRef(null);
  const { t } = useLanguage();

  const handleSoldOut = async (listing) => {
    if (!confirm(`Mark "${listing.name}" as sold out?`)) return;
    try {
      await markAsSoldOut(listing.id);
      setListings((prev) =>
        prev.map((l) =>
          l.id === listing.id ? { ...l, is_sold_out: true } : l,
        ),
      );
    } catch (error) {
      alert(t("failed_sold_out"));
    }
  };

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

  useEffect(() => {
    const fetchListings = async () => {
      if (!supabase) {
        setIsLoading(false);
        return;
      }
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const data = await getListingsByMerchant(user.id);
        setListings(data || []);
      } catch (e) {
        console.error("Failed to fetch listings:", e);
        setError(t("dashboard_error"));
      }
      setIsLoading(false);
    };
    fetchListings();
  }, []);

  const filteredListings = listings.filter((listing) =>
    listing.name?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

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

  return (
    <div className="dashboard">
      <AppHeader
        session={session}
        onLogout={onLogout}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        isAdmin={isAdmin}
      />

      <main className="dashboard__content">
        <div className="dashboard__top-bar">
          <h2 className="dashboard__title">{t("my_listings")}</h2>
          <div className="dashboard__top-bar-actions">
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
            <Link to="/profile" className="dashboard__edit-btn">
              {t("dashboard_edit_profile")}
            </Link>
            <Link to="/create" className="dashboard__add-btn">
              {t("dashboard_add_listing")}
            </Link>
          </div>
        </div>

        {isLoading ? (
          <p className="dashboard__status">{t("dashboard_loading")}</p>
        ) : error ? (
          <p className="dashboard__status dashboard__status--error">{error}</p>
        ) : sortedListings.length > 0 ? (
          <div className="dashboard__grid">
            {sortedListings.map((listing) => (
              <ListingItem
                key={listing.id}
                listing={listing}
                showEdit={true}
                onSelect={(l) => navigate(`/viewListing/${l.id}`)}
                onSoldOut={handleSoldOut}
              />
            ))}
          </div>
        ) : (
          <div className="dashboard__empty">
            <p className="dashboard__status">
              {searchQuery ? t("no_listings_search") : t("no_listings_yet")}
            </p>
            {!searchQuery && (
              <Link to="/create" className="dashboard__add-btn">
                {t("create_first_listing")}
              </Link>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
