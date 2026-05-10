import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListingItem from '../../components/ListingItem/ListingItem';
import { supabase } from '../../lib/supabaseClient';
import { getListingsByMerchant, markAsSoldOut } from '../../api/listings';
import AppHeader from '../../components/AppHeader/AppHeader.jsx'
import './Home.css';

export default function Home({ onLogout }) {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleSoldOut = async (listing) => {
    if (!confirm(`Mark "${listing.name}" as sold out?`)) return;
    try {
      await markAsSoldOut(listing.id);
      setListings(prev =>
        prev.map(l => l.id === listing.id ? { ...l, is_sold_out: true } : l)
      );
    } catch (error) {
      alert("Failed to mark as sold out. Please try again.");
    }
  };

  useEffect(() => {
    const fetchListings = async () => {
      if (!supabase) { setIsLoading(false); return; }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      try {
      const data = await getListingsByMerchant(user.id);
        setListings(data || []);
      } catch (e) {
        console.error('Failed to fetch listings:', e);
        setError('Failed to load your listings. Please try again.');
      }
      setIsLoading(false);
    };
    fetchListings();
  }, []);

  return (
    <div className="dashboard">
      <AppHeader
        session={true}
        onLogout={onLogout}
      />

      <main className="dashboard__content">
        <div className="dashboard__top-bar">
          <h2 className="dashboard__title">MY LISTINGS:</h2>
          <Link to="/create" className="dashboard__add-btn">+ Add new listing</Link>
        </div>

        {isLoading ? (
          <p className="dashboard__status">Loading listings...</p>
        ) : error ? (
          <p className="dashboard__status dashboard__status--error">{error}</p>
        ) : listings.length > 0 ? (
          <div className="dashboard__grid">
            {listings.map((listing) => (
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
            <p className="dashboard__status">You have no listings yet.</p>
            <Link to="/create" className="dashboard__add-btn">Create your first listing</Link>
          </div>
        )}
      </main>
    </div>
  );
}
