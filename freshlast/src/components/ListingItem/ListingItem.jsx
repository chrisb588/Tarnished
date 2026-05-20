import { useNavigate } from "react-router-dom";
import "./ListingItem.css";
import { useLanguage } from "../../context/languageContext";

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("en-PH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getExpiryLabel(expiresAt) {
  if (!expiresAt) return null;
  const diffMs = new Date(expiresAt) - new Date();
  if (diffMs <= 0) return null;
  const hours = Math.ceil(diffMs / (1000 * 60 * 60));
  if (hours < 24) return { text: `${hours}h left`, urgent: hours <= 6 };
  const days = Math.ceil(hours / 24);
  return { text: `${days}d left`, urgent: false };
}

export default function ListingItem({
  listing,
  showEdit = false,
  onSelect,
  onSoldOut,
}) {
  const navigate = useNavigate();
  const expiry = getExpiryLabel(listing.expires_at);
  const isSoldOut = listing.is_sold_out;
  const { t } = useLanguage();

  const original = Number(listing.original_price);
  const discounted = Number(listing.discounted_price);
  const hasDiscount =
    Number.isFinite(original) &&
    original > 0 &&
    Number.isFinite(discounted) &&
    discounted > 0 &&
    original > discounted;

  const discountPct = hasDiscount
    ? Math.round(((original - discounted) / original) * 100)
    : 0;

  const displayPrice = hasDiscount ? discounted : original;

  return (
    <article
      className={`
    listing-card
    ${isSoldOut ? " listing-card--sold-out" : ""}
    ${hasDiscount ? " listing-card--sale" : ""}
  `}
      onClick={onSelect ? () => onSelect(listing) : undefined}
      role={onSelect ? "button" : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* IMAGE */}
      <div className="listing-card__image">
        {listing.image ? (
          <img src={listing.image} alt={listing.name} loading="lazy" />
        ) : (
          <div className="listing-card__placeholder">🥬</div>
        )}

        {/* top-left: discount */}
        {!isSoldOut && (
          <span
            className={`listing-card__discount${!hasDiscount ? " listing-card__discount--none" : ""}`}
          >
            {hasDiscount ? `-${discountPct}%` : t("li_no_discount")}
          </span>
        )}

        {/* top-right: status */}
        {isSoldOut ? (
          <span className="listing-card__status listing-card__status--soldout">
            {t("li_sold_out")}
          </span>
        ) : listing.category ? (
          <span className="listing-card__status">{listing.category}</span>
        ) : null}

        {/* bottom: expiry overlay */}
        {expiry && !isSoldOut && (
          <span
            className={`listing-card__expiry${expiry.urgent ? " listing-card__expiry--urgent" : ""}`}
          >
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 7v5l3 2" />
            </svg>
            {expiry.text}
          </span>
        )}
      </div>

      {/* INFO */}
      <div className="listing-card__info">
        <h3 className="listing-card__name">{listing.name}</h3>
        {listing.merchant_name && (
          <p className="listing-card__vendor">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 9l2-5h14l2 5" />
              <path d="M3 9v11h18V9" />
              <path d="M3 9h18" />
            </svg>
            {listing.merchant_name}
          </p>
        )}

        <div className="listing-card__price-row">
          <span className="listing-card__price">₱{displayPrice}</span>
          {hasDiscount && (
            <span className="listing-card__price-original">
              ₱{listing.original_price}
            </span>
          )}
        </div>

        <div className="listing-card__meta">
          {listing.quantity && (
            <span className="listing-card__chip">
              {listing.quantity} {listing.unit}
            </span>
          )}
          {listing.type && (
            <span className="listing-card__chip">{listing.type}</span>
          )}
        </div>
        {formatDate(listing.created_at) && (
          <p className="listing-card__date">
            {t("li_listed")} {formatDate(listing.created_at)}
          </p>
        )}
      </div>

      {/* ACTIONS */}
      {showEdit && (
        <div className="listing-card__actions">
          <button
            className="listing-card__btn listing-card__btn--ghost"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/edit/${listing.id}`);
            }}
          >
            {t("li_edit")}
          </button>
          {onSoldOut && !isSoldOut && (
            <button
              className="listing-card__btn listing-card__btn--danger"
              onClick={(e) => {
                e.stopPropagation();
                onSoldOut(listing);
              }}
            >
              {t("li_mark_sold_out")}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
