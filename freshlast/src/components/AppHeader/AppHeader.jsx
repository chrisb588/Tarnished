import { Link } from 'react-router-dom'
import { IoLogOut } from 'react-icons/io5'
import './AppHeader.css'
import { useLocation } from 'react-router-dom'

const SearchIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const LeafIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h7v7a9 9 0 0 1-9 9z" /><path d="M2 22 17 7" />
  </svg>
);

const UserIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default function AppHeader({ session, onLogout, onLoginClick, searchQuery, onSearchChange, isAdmin }) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith('/dashboard');

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {/* Brand */}
        <Link to="/" className="app-header__brand">
          <span className="app-header__brand-icon"><LeafIcon /></span>
          <span className="app-header__brand-name">FreshLast</span>
        </Link>




        {/* Actions */}
        <div className="app-header__actions">
          {onSearchChange && (
            <div className="app-header__search">
              <SearchIcon />
              <input
                type="text"
                className="app-header__search-input"
                placeholder="Search products…"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="app-header__search-clear"
                  onClick={() => onSearchChange('')}
                  aria-label="Clear search"
                >×</button>
              )}
            </div>
          )}

          <Link to="/map" className="app-header__nav-link">
            Map
          </Link>

          {isAdmin && (
            <Link to="/admin" className="app-header__nav-link">
              Admin Dashboard
            </Link>
          )}

          {session && onLogout ? (
            <>
              {/* Nav */}
              <nav className="app-header__nav">
                {session && (
                  <Link
                    to="/dashboard"
                    className={`app-header__nav-link${isDashboard ? ' app-header__nav-link--active' : ''}`}
                  >
                    My Listings
                  </Link>
                )}
              </nav>
              {/* Nav */}
              <nav className="app-header__cta">
                {session && (
                  <Link
                    to="/create"
                  >
                    Add New Listing
                  </Link>
                )}
              </nav>
              <Link
                to={`/merchant/${session?.user?.id ?? ''}`}
                className="app-header__icon-btn"
                title="My Profile"
                aria-label="View my merchant profile"
              >
                <UserIcon />
              </Link>
              <button className="app-header__icon-btn" type="button" onClick={onLogout} title="Log out" aria-label="Log out">
                <IoLogOut />
              </button>
            </>
          ) : onLoginClick ? (
            <button className="app-header__cta" onClick={onLoginClick}>
              Log in to Sell
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
}
