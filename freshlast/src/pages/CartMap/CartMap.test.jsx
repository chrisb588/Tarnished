import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// Mock heavy deps
vi.mock('../../api/profile', () => ({ getAllMerchants: vi.fn() }));
vi.mock('../../components/AppHeader/AppHeader', () => ({ default: () => <div data-testid="app-header" /> }));
vi.mock('../../components/VendorMap/VendorMap', () => ({
  default: vi.fn(({ merchants, onPinClick }, ref) => (
    <div data-testid="vendor-map">
      {merchants.map((m) => (
        <button key={m.id} data-testid={`pin-${m.id}`} onClick={() => onPinClick(m)}>
          {m.name}
        </button>
      ))}
    </div>
  )),
}));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => vi.fn() };
});

import { getAllMerchants } from '../../api/profile';
import CartMap from './CartMap';

const MERCHANT = {
  id: 'merchant-1',
  name: 'Test Stall',
  latitude: 10.3157,
  longitude: 123.8854,
  operating_days: [],
};

const mockCartItems = [{ merchantId: 'merchant-1', listingId: 'l1', name: 'Adobo', quantity: 2, discountedPrice: 50 }];

const CartContextMock = {
  cartItems: mockCartItems,
  total: 100,
};

vi.mock('../../contexts/CartContext', () => ({
  useCart: () => CartContextMock,
}));

function renderCartMap() {
  return render(
    <MemoryRouter>
      <CartMap session={null} onLogout={vi.fn()} onLoginClick={vi.fn()} isAdmin={false} />
    </MemoryRouter>
  );
}

describe('CartMap pin click', () => {
  beforeEach(() => {
    getAllMerchants.mockResolvedValue([MERCHANT]);
    // Suppress geolocation
    Object.defineProperty(global.navigator, 'geolocation', {
      value: { getCurrentPosition: vi.fn((_ok, err) => err(new Error('no geo'))) },
      configurable: true,
    });
  });

  it('opens the drawer when a pin is clicked', async () => {
    renderCartMap();
    // Wait for map to load
    const pin = await screen.findByTestId('pin-merchant-1');
    fireEvent.click(pin);
    // Drawer should have the --visible class
    await waitFor(() => {
      const drawer = document.querySelector('.cart-map-page__drawer');
      expect(drawer).toHaveClass('cart-map-page__drawer--visible');
    });
    // Drawer should show the merchant name
    const drawerName = document.querySelector('.cart-map-page__drawer-name');
    expect(drawerName).toHaveTextContent('Test Stall');
  });

  it('onPinClick handler is called with the correct merchant', async () => {
    const { default: VendorMap } = await import('../../components/VendorMap/VendorMap');
    renderCartMap();
    const pin = await screen.findByTestId('pin-merchant-1');
    fireEvent.click(pin);
    await waitFor(() => {
      const lastProps = VendorMap.mock.calls.at(-1)?.[0];
      expect(lastProps?.selectedMerchantId).toBe('merchant-1');
    });
  });
});
