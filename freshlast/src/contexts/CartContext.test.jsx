import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';

const wrapper = ({ children }) => <CartProvider>{children}</CartProvider>;

const mockListing = {
  id: 'listing-1',
  name: 'Garlic Rice',
  discounted_price: 25,
  original_price: 35,
  image: null,
  unit: 'serving',
  is_sold_out: false,
  expires_at: null,
  merchant_id: 'merchant-1',
  merchant_name: "Mang Juan's",
};

const mockMerchant = { id: 'merchant-1', name: "Mang Juan's" };

beforeEach(() => localStorage.clear());

describe('useCart', () => {
  it('starts with empty cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.total).toBe(0);
  });

  it('addToCart adds a new item with quantity 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].listingId).toBe('listing-1');
    expect(result.current.cartItems[0].quantity).toBe(1);
    expect(result.current.cartItems[0].discountedPrice).toBe(25);
  });

  it('addToCart with qty param sets initial quantity', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant, 3); });
    expect(result.current.cartItems[0].quantity).toBe(3);
  });

  it('addToCart increments quantity when item already in cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });

  it('removeFromCart removes the item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    act(() => { result.current.removeFromCart('listing-1'); });
    expect(result.current.cartItems).toHaveLength(0);
  });

  it('updateQuantity sets quantity and clamps to min 1', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    act(() => { result.current.updateQuantity('listing-1', 4); });
    expect(result.current.cartItems[0].quantity).toBe(4);
    act(() => { result.current.updateQuantity('listing-1', 0); });
    expect(result.current.cartItems[0].quantity).toBe(1);
  });

  it('clearCart empties the cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    act(() => { result.current.clearCart(); });
    expect(result.current.cartItems).toHaveLength(0);
  });

  it('itemCount is the sum of all quantities', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant, 3); });
    expect(result.current.itemCount).toBe(3);
  });

  it('total is sum of quantity × discountedPrice', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant, 2); });
    expect(result.current.total).toBe(50); // 2 × 25
  });

  it('uses original_price when no discount applies', () => {
    const noDiscount = { ...mockListing, discounted_price: 0 };
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(noDiscount, mockMerchant); });
    expect(result.current.cartItems[0].discountedPrice).toBe(35);
  });

  it('persists cart to localStorage on change', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    act(() => { result.current.addToCart(mockListing, mockMerchant); });
    const stored = JSON.parse(localStorage.getItem('tarnished_cart'));
    expect(stored).toHaveLength(1);
    expect(stored[0].listingId).toBe('listing-1');
  });

  it('loads cart from localStorage on mount', () => {
    const stored = [{ listingId: 'listing-1', quantity: 2, discountedPrice: 25, merchantId: 'merchant-1', merchantName: "Mang Juan's", name: 'Garlic Rice', originalPrice: 35, imageUrl: null, unit: 'serving', isSoldOut: false, expiresAt: null }];
    localStorage.setItem('tarnished_cart', JSON.stringify(stored));
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toHaveLength(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
  });
});
