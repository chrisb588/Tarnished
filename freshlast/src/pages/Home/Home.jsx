import React, { useState } from 'react';
import AuthModal from '../../components/AuthModal/AuthModal';
import ListingItem from '../../components/ListingItem/ListingItem';
import { Link } from 'react-router-dom';
import "./Home.css";

import '../../App.css'

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Array of 4 listing items
  const listings = [1, 2, 3, 4];

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
          {listings.map((id) => (
            <ListingItem key={id} />
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