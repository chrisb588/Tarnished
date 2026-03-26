import React, { useState, useEffect } from 'react';
import ListingItem from '../../components/ListingItem/ListingItem';
import VendorHeader from '../../components/VendorHeader/VendorHeader';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getListingsByMerchant } from '../../api/listings';
import "./Home.css";

export default function Home({ onLogout }) {
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchListings = async () => {
      if (!supabase) { setIsLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const data = await getListingsByMerchant(user.id);
      setListings(data || []);
      setIsLoading(false);
    };
    fetchListings();
  }, []);

  return (
    <div className="dashboard">
      <VendorHeader onLogout={onLogout} />

      <div className="dashboard__content">
        <div className="dashboard__welcome">
          <h1 className="dashboard__title">Welcome Back, Vendor!</h1>
          <p className="dashboard__subtitle">Here you can see your active listings.</p>
        </div>

        <div className="dashboard__actions">
          <Link to="/create" className="dashboard__add-btn">
            + Add new listing
          </Link>
        </div>

        {isLoading ? (
          <p className="dashboard__status">Loading listings...</p>
        ) : listings.length > 0 ? (
          <div className="dashboard__grid">
            {listings.map((listing) => (
              <ListingItem key={listing.id} listing={listing} showEdit={true} />
            ))}
          </div>
        ) : (
          <div className="dashboard__empty">
            <p>You have no listings yet.</p>
            <Link to="/create" className="dashboard__add-btn">
              Create your first listing
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}