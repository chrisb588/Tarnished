import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './VendorHeader.css'

export default function VendorHeader({ onLogout }) {
  const navigate = useNavigate()
  const [showDropdown, setShowDropdown] = useState(false)

  return (
    <header className="vendor-header">
      <div className="vendor-header__logo">LOGO</div>

      <div className="vendor-header__actions">
        <button className="vendor-header__icon-btn" title="Dashboard" onClick={() => navigate('/')}>
          🏠
        </button>

        <button className="vendor-header__icon-btn" title="Notifications">
          🔔
        </button>

        <button className="vendor-header__icon-btn" 
        title="AdminDashboard"
        onClick={() => navigate('/admin')}>
          ⚙️
        </button>

        <div className="vendor-header__profile-wrapper">
          <button
            className="vendor-header__icon-btn"
            onClick={() => setShowDropdown(!showDropdown)}
            title="Profile"
          >
            👤
          </button>

          {showDropdown && (
            <div className="vendor-header__dropdown">
              <button
                className="vendor-header__dropdown-item"
                onClick={() => { setShowDropdown(false); navigate('/profile') }}
              >
                Edit Profile
              </button>
              <button
                className="vendor-header__dropdown-item vendor-header__dropdown-item--danger"
                onClick={() => { setShowDropdown(false); onLogout?.() }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}