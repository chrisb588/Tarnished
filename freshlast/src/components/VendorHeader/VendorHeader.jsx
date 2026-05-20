import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./VendorHeader.css";

function HomeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
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
}

export default function VendorHeader({ onLogout }) {
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const { t } = useLanguage();

  return (
    <header className="vendor-header">
      <div className="vendor-header__inner">
        <h1 className="vendor-header__logo">FreshLast</h1>

        <nav className="vendor-header__nav">
          <a
            href="#"
            className="vendor-header__nav-link vendor-header__nav-link--active"
          >
            {t("vh_vendor_dashboard")}
          </a>
        </nav>

        <div className="vendor-header__actions">
          <button
            className="vendor-header__icon-btn"
            title={t("vh_marketplace")}
            onClick={() => navigate("/")}
          >
            <HomeIcon />
          </button>

          <button
            className="vendor-header__icon-btn"
            title={t("vh_notifications")}
          >
            <BellIcon />
          </button>

          <button
            className="vendor-header__icon-btn"
            title="Admin Dashboard"
            onClick={() => navigate("/admin")}
          >
            <SettingsIcon />
          </button>

          <div className="vendor-header__profile-wrapper">
            <button
              className="vendor-header__icon-btn"
              onClick={() => setShowDropdown(!showDropdown)}
              title={t("vh_profile")}
            >
              <UserIcon />
            </button>

            {showDropdown && (
              <div className="vendor-header__dropdown">
                <button
                  className="vendor-header__dropdown-item"
                  onClick={() => {
                    setShowDropdown(false);
                    navigate("/profile");
                  }}
                >
                  {t("dashboard_edit_profile")}
                </button>
                <button
                  className="vendor-header__dropdown-item vendor-header__dropdown-item--danger"
                  onClick={() => {
                    setShowDropdown(false);
                    onLogout?.();
                  }}
                >
                  {t("vh_log_out")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
