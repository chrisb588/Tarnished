import { useNavigate } from 'react-router-dom';
import { useCart } from '../../contexts/CartContext';
import './ListingItem.css';

function formatDate(dateStr) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
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

export default function ListingItem({ listing, showEdit = false, onSelect, onSoldOut }) {
  const navigate = useNavigate();
  const { cartItems, addToCart, removeFromCart, updateQuantity } = useCart();

  const expiry = getExpiryLabel(listing.expires_at);
  const isSoldOut = listing.is_sold_out;

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

  const cartItem = cartItems.find((item) => item.listingId === listing.id);
  const inCart = !!cartItem;

  return (
    <article
      className={`
    listing-card
    ${isSoldOut ? ' listing-card--sold-out' : ''}
    ${hasDiscount ? ' listing-card--sale' : ''}
  `}
      onClick={onSelect ? () => onSelect(listing) : undefined}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
    >
      {/* IMAGE */}
      <div className="listing-card__image">
        {listing.image
          ? <img src={listing.image} alt={listing.name} loading="lazy" />
          : <div className="listing-card__placeholder">🥬</div>
        }

        {!isSoldOut && (
          <span className={`listing-card__discount${!hasDiscount ? ' listing-card__discount--none' : ''}`}>
            {hasDiscount ? `-${discountPct}%` : 'No Discount'}
          </span>
        )}

        {isSoldOut ? (
          <span className="listing-card__status listing-card__status--soldout">Sold Out</span>
        ) : listing.category ? (
          <span className="listing-card__status">{listing.category}</span>
        ) : null}

        {expiry && !isSoldOut && (
          <span className={`listing-card__expiry${expiry.urgent ? ' listing-card__expiry--urgent' : ''}`}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
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
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l2-5h14l2 5" /><path d="M3 9v11h18V9" /><path d="M3 9h18" />
            </svg>
            {listing.merchant_name}
          </p>
        )}

        <div className="listing-card__price-row">
          <span className="listing-card__price">₱{displayPrice}</span>
          {hasDiscount && (
            <span className="listing-card__price-original">₱{listing.original_price}</span>
          )}
        </div>

        <div className="listing-card__meta">
          {listing.quantity && (
            <span className="listing-card__chip">{listing.quantity} {listing.unit}</span>
          )}
          {listing.type && (
            <span className="listing-card__chip">{listing.type}</span>
          )}
        </div>
        {formatDate(listing.created_at) && (
          <p className="listing-card__date">Listed {formatDate(listing.created_at)}</p>
        )}
      </div>

      {/* ACTIONS — vendor edit mode */}
      {showEdit && (
        <div className="listing-card__actions">
          <button
            className="listing-card__btn listing-card__btn--ghost"
            onClick={(e) => { e.stopPropagation(); navigate(`/edit/${listing.id}`); }}
          >
            Edit
          </button>
          {onSoldOut && !isSoldOut && (
            <button
              className="listing-card__btn listing-card__btn--danger"
              onClick={(e) => { e.stopPropagation(); onSoldOut(listing); }}
            >
              Mark Sold Out
            </button>
          )}
        </div>
      )}

      {/* CART ROW — browse mode */}
      {!showEdit && (
        <div className="listing-card__cart-row">
          {isSoldOut ? (
            <button className="listing-card__cart-btn listing-card__cart-btn--disabled" disabled>
              Sold Out
            </button>
          ) : inCart ? (
            <div className="listing-card__stepper">
              <button
                aria-label="−"
                className="listing-card__stepper-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  if (cartItem.quantity === 1) removeFromCart(listing.id);
                  else updateQuantity(listing.id, cartItem.quantity - 1);
                }}
              >
                −
              </button>
              <span className="listing-card__stepper-qty">{cartItem.quantity}</span>
              <button
                aria-label="+"
                className="listing-card__stepper-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  updateQuantity(listing.id, cartItem.quantity + 1);
                }}
              >
                +
              </button>
            </div>
          ) : (
            <button
              className="listing-card__cart-btn"
              onClick={(e) => {
                e.stopPropagation();
                addToCart(listing, { id: listing.merchant_id, name: listing.merchant_name });
              }}
            >
              + Add to Cart
            </button>
          )}
        </div>
      )}
    </article>
  );
}
