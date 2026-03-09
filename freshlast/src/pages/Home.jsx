import React, { useState } from 'react';
import ListingItem from '../components/ListingItem/ListingItem';
import AuthModal from '../components/AuthModal/AuthModal';
import { Link } from 'react-router-dom';

import '../App.css'

export default function Home() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  return (
    <div className="home-container">
      {/* 1. Your Header or Logo could go here */}
      <h1>Marketplace</h1>

    <Link to="/create" className="floating-add-btn">
            + Sell Item
        </Link>

      {/* 2. Your Grid of Items */}
      <div className="listing-grid">
        <ListingItem />
        {/* You'll eventually map over multiple items here */}
      </div>

      {/* 3. The Action Button */}
      <button 
        className="auth-trigger-btn" 
        onClick={() => setIsAuthOpen(true)}
      >
        Sign In to Sell
      </button>

      {/* 4. The Modal (remains hidden until state is true) */}
      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
      />
    </div>
  );
}