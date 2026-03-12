import React, { useState, useEffect } from 'react';
import AuthModal from '../../components/AuthModal/AuthModal';
import ListingItem from '../../components/ListingItem/ListingItem';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getListingsByMerchant } from '../../api/listings';
import "./Home.css";

import '../../App.css'

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const fetchListings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const data = await getListingsByMerchant(user.id);
      setListings(data);
    };
    fetchListings();
  }, []);

    return (
    <>
      {/* Header */}
      <header className="header">
        <div className="logo">LOGO</div>

        <div className="header-icons">
          <button className="icon-btn">🔔</button>
          <button className="icon-btn">👤</button>
          <button
            className="auth-trigger-btn"
            onClick={() => setIsAuthOpen(true)}
          >
          Log In to Sell
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="main-content">

        {/* Welcome */}
        <div className="welcome-section">
          <h1 className="welcome-title">Welcome Back, Vendor!</h1>
          <p className="welcome-subtitle">
            Here you can see your active listings.
          </p>
        </div>

        {/* Add Listing */}
        <div className="add-listing-container">
          <Link to="/create" className="add-listing-btn">
            + Add new listing
          </Link>
        </div>

        {/* Products */}
        <div className="products-grid">
          {listings.map((listing) => (
            <ListingItem key={listing.id} listing={listing} />
          ))}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  );
}
