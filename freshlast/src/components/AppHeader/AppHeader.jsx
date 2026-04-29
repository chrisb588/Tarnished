import { Link } from 'react-router-dom'
import './AppHeader.css'

function SearchIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.3-4.3"/>
    </svg>
  )
}

export default function AppHeader({ session, onLogout, onLoginClick, searchQuery, onSearchChange }) {
  return (
    <header className="app-header">
      <div className="app-header__logo">
        <span className="app-header__logo--green">Fr</span>
        <span className="app-header__logo--orange">è</span>
        <span className="app-header__logo--green">shL</span>
        <span className="app-header__logo--orange">a</span>
        <span className="app-header__logo--green">st</span>
      </div>

      {onSearchChange && (
        <div className="app-header__search">
          <input
            type="text"
            className="app-header__search-input"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          <button className="app-header__search-btn" aria-label="Search">
            <SearchIcon />
          </button>
        </div>
      )}

      <div className="app-header__actions">
        {session && onLogout ? (
          <>
            <Link to="/dashboard" className="app-header__btn">My Listings</Link>
            <button className="app-header__btn" onClick={onLogout}>Log Out</button>
          </>
        ) : onLoginClick ? (
          <button className="app-header__btn" onClick={onLoginClick}>Log in to Sell</button>
        ) : null}
      </div>
    </header>
  )
}