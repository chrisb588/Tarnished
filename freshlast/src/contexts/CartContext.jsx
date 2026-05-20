import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext(null);

const STORAGE_KEY = 'tarnished_cart';

function loadCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(loadCart);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  function addToCart(listing, merchant, qty = 1) {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.listingId === listing.id);
      if (existing) {
        return prev.map((item) =>
          item.listingId === listing.id
            ? { ...item, quantity: item.quantity + qty }
            : item
        );
      }
      const original = Number(listing.original_price);
      const discounted = Number(listing.discounted_price);
      const hasDiscount = original > 0 && discounted > 0 && original > discounted;
      return [
        ...prev,
        {
          listingId: listing.id,
          merchantId: merchant.id,
          merchantName: merchant.name,
          name: listing.name,
          discountedPrice: hasDiscount ? discounted : original,
          originalPrice: original,
          imageUrl: listing.image ?? null,
          unit: listing.unit ?? '',
          quantity: qty,
          isSoldOut: listing.is_sold_out ?? false,
          expiresAt: listing.expires_at ?? null,
        },
      ];
    });
  }

  function removeFromCart(listingId) {
    setCartItems((prev) => prev.filter((item) => item.listingId !== listingId));
  }

  function updateQuantity(listingId, qty) {
    const clamped = Math.max(1, qty);
    setCartItems((prev) =>
      prev.map((item) =>
        item.listingId === listingId ? { ...item, quantity: clamped } : item
      )
    );
  }

  function clearCart() {
    setCartItems([]);
  }

  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const total = cartItems.reduce(
    (sum, item) => sum + item.quantity * item.discountedPrice,
    0
  );

  return (
    <CartContext.Provider
      value={{ cartItems, itemCount, total, addToCart, removeFromCart, updateQuantity, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
