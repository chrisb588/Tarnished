import { Link } from "react-router-dom";
import { IoLogOut } from "react-icons/io5";
import "./AppHeader.css";
import { useLocation } from "react-router-dom";

const SearchIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const LeafIcon = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M11 20A7 7 0 0 1 4 13c0-5 4-9 9-9h7v7a9 9 0 0 1-9 9z" />
    <path d="M2 22 17 7" />
  </svg>
);

function AppLogo() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 68 70"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.1219 14.3695C1.66476 25.8641 7.13956 54.8004 12.1926 69.102H43.4434C43.4434 63.3041 41.1113 57.5061 30.8498 50.3167C26.1855 47.0488 25.0194 41.0897 28.9841 36.8655C32.2491 33.3867 38.0795 33.3867 42.0442 36.8655L66.765 20.3993C59.7685 11.8184 38.579 2.87479 20.1219 14.3695Z"
        fill="white"
        stroke="white"
      />
      <path
        d="M0.765015 3.23743L2.63074 5.78853C2.63074 11.3545 0.765015 18.544 6.82862 24.3419C11.265 15.4544 16.265 10.9544 26.1855 7.87578C23.2003 1.56763 14.5247 2.15515 10.5601 3.23743C12.1926 5.78853 8.81095 6.94811 6.82862 5.78853C4.84629 4.62894 5.42932 1.38209 6.82862 0.454422L0.765015 3.23743Z"
        fill="white"
        stroke="white"
      />
      <path
        d="M60.935 46.8376L47.1753 69.3337C48.1079 58.6657 39.9455 51.4759 32.2495 46.8376H60.935ZM47.4077 48.9255C45.6048 48.9257 44.1433 50.3787 44.143 52.1716C44.143 53.9646 45.6047 55.4184 47.4077 55.4186C49.2109 55.4186 50.6733 53.9647 50.6733 52.1716C50.673 50.3786 49.2107 48.9255 47.4077 48.9255Z"
        fill="white"
      />
    </svg>
  );
}

const UserIcon = () => (
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
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
  </svg>
);

export default function AppHeader({
  session,
  onLogout,
  onLoginClick,
  searchQuery,
  onSearchChange,
  isAdmin,
}) {
  const location = useLocation();
  const isDashboard = location.pathname.startsWith("/dashboard");

  return (
    <header className="app-header">
      <div className="app-header__inner">
        {/* Brand */}
        <Link to="/" className="app-header__brand">
          <span className="app-header__brand-icon">
            <AppLogo size={22} />
          </span>
          <span className="app-header__brand-name">
            <span className="app-header__brand-color-primary">Fresh</span>
            <span className="app-header__brand-color-secondary">Last</span>
          </span>
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
                  onClick={() => onSearchChange("")}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>
          )}

          <Link to="/map" className="app-header__nav-link">
            Vendor Map
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
                    className={`app-header__nav-link${isDashboard ? " app-header__nav-link--active" : ""}`}
                  >
                    My Listings
                  </Link>
                )}
              </nav>
              {/* Nav */}
              <nav className="app-header__cta">
                {session && <Link to="/create">Add New Listing</Link>}
              </nav>
              <Link
                to={`/merchant/${session?.user?.id ?? ""}`}
                className="app-header__icon-btn"
                title="My Profile"
                aria-label="View my merchant profile"
              >
                <UserIcon />
              </Link>
              <button
                className="app-header__icon-btn"
                type="button"
                onClick={onLogout}
                title="Log out"
                aria-label="Log out"
              >
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
