import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ListingItem from '../../components/ListingItem/ListingItem';
import { supabase } from '../../lib/supabaseClient';
import { getListingsByMerchant } from '../../api/listings';
import './Home.css';

export default function Home({ onLogout }) {
  const navigate = useNavigate();
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
      <header className="dashboard__header">
        <div className="dashboard__logo">
          <span className="dashboard__logo--green">Fr</span>
          <span className="dashboard__logo--orange">è</span>
          <span className="dashboard__logo--green">shL</span>
          <span className="dashboard__logo--orange">a</span>
          <span className="dashboard__logo--green">st</span>
        </div>

        <div className="dashboard__header-actions">
          <Link to="/" className="dashboard__btn">← Marketplace</Link>
          <button className="dashboard__btn" onClick={onLogout}>Log Out</button>
        </div>
      </header>

      <main className="dashboard__content">
        <div className="dashboard__top-bar">
          <h2 className="dashboard__title">MY LISTINGS:</h2>
          <Link to="/create" className="dashboard__add-btn">+ Add new listing</Link>
        </div>

        {isLoading ? (
          <p className="dashboard__status">Loading listings...</p>
        ) : listings.length > 0 ? (
          <div className="dashboard__grid">
            {listings.map((listing) => (
              <ListingItem key={listing.id} listing={listing} showEdit={true} onSelect={(l) => navigate(`/viewListing/${l.id}`)} />
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
