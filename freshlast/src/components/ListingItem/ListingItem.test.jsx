import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom';
import { CartProvider } from '../../contexts/CartContext';
import ListingItem from './ListingItem';

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
  quantity: 10,
  type: 'Rice',
  created_at: '2026-01-01T00:00:00Z',
};

const renderListing = (props = {}) =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ListingItem listing={mockListing} {...props} />
      </CartProvider>
    </MemoryRouter>
  );

beforeEach(() => localStorage.clear());

describe('ListingItem cart UI', () => {
  it('shows Add to Cart button when not in cart and not sold out', () => {
    renderListing();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('does not show Add to Cart button when showEdit is true', () => {
    renderListing({ showEdit: true });
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('shows disabled Sold Out button when listing is sold out', () => {
    renderListing({ listing: { ...mockListing, is_sold_out: true } });
    const btn = screen.getByRole('button', { name: /sold out/i });
    expect(btn).toBeDisabled();
  });

  it('clicking Add to Cart switches to stepper', () => {
    renderListing();
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '−' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '+' })).toBeInTheDocument();
  });

  it('stepper + increments quantity', () => {
    renderListing();
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('stepper − at qty 1 removes item from cart (shows Add to Cart again)', () => {
    renderListing();
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    fireEvent.click(screen.getByRole('button', { name: '−' }));
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });
});

const baseListing = {
  id: 1,
  name: 'Fresh Cabbage',
  original_price: 50,
  discounted_price: 35,
  quantity: 10,
  unit: 'kg',
  type: 'vegetable',
  image: null,
  expires_at: null,
  is_sold_out: false,
}

const renderBase = (props = {}) =>
  render(
    <MemoryRouter>
      <CartProvider>
        <ListingItem listing={baseListing} {...props} />
      </CartProvider>
    </MemoryRouter>
  );

describe('ListingItem', () => {
  it('renders the listing name and prices', () => {
    renderBase();
    expect(screen.getByText('Fresh Cabbage')).toBeInTheDocument()
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(screen.getByText('₱35')).toBeInTheDocument()
  })

  it('renders updated values when given a new listing prop (no stale internal state)', () => {
    const { rerender } = renderBase();

    const updatedListing = { ...baseListing, name: 'Ripe Tomatoes', original_price: 80, discounted_price: 60 }
    rerender(
      <MemoryRouter>
        <CartProvider>
          <ListingItem listing={updatedListing} />
        </CartProvider>
      </MemoryRouter>
    )

    expect(screen.getByText('Ripe Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('₱80')).toBeInTheDocument()
    expect(screen.queryByText('Fresh Cabbage')).not.toBeInTheDocument()
  })

  it('shows a countdown label when expires_at is within 24 hours', () => {
    const listing = {
      ...baseListing,
      expires_at: new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString(),
    }
    renderBase({ listing })
    expect(screen.getByText('3h left')).toBeInTheDocument()
  })

  it('shows a countdown in days when expires_at is more than 24 hours away', () => {
    const listing = {
      ...baseListing,
      expires_at: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    }
    renderBase({ listing })
    expect(screen.getByText('3d left')).toBeInTheDocument()
  })

  it('does not show a countdown when expires_at is null', () => {
    renderBase()
    expect(screen.queryByText(/Expires in/)).not.toBeInTheDocument()
  })

  it('shows original price as main price without strikethrough when discounted_price is 0', () => {
    const { container } = renderBase({ listing: { ...baseListing, discounted_price: 0 } });
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(screen.queryByText('₱35')).not.toBeInTheDocument()
    expect(container.querySelector('.listing-card__price-original')).not.toBeInTheDocument()
  })

  it('shows original price as main price without strikethrough when discounted_price is null', () => {
    const { container } = renderBase({ listing: { ...baseListing, discounted_price: null } });
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(container.querySelector('.listing-card__price-original')).not.toBeInTheDocument()
  })

  it('applies sold-out class when is_sold_out is true', () => {
    const listing = { ...baseListing, is_sold_out: true }
    const { container } = renderBase({ listing });
    expect(container.querySelector('.listing-card--sold-out')).toBeInTheDocument()
  })

  it('does not apply sold-out class when is_sold_out is false', () => {
    const { container } = renderBase();
    expect(container.querySelector('.listing-card--sold-out')).not.toBeInTheDocument()
  })

  it('shows Mark Sold Out button when showEdit is true and onSoldOut is provided', () => {
    renderBase({ showEdit: true, onSoldOut: () => {} });
    expect(screen.getByRole('button', { name: 'Mark Sold Out' })).toBeInTheDocument()
  })

  it('calls onSoldOut with the listing when Mark Sold Out button is clicked', async () => {
    const user = userEvent.setup()
    const onSoldOut = vi.fn()
    renderBase({ showEdit: true, onSoldOut });
    await user.click(screen.getByRole('button', { name: 'Mark Sold Out' }))
    expect(onSoldOut).toHaveBeenCalledWith(baseListing)
  })

  it('does not show Mark Sold Out button when showEdit is false', () => {
    renderBase({ showEdit: false });
    expect(screen.queryByRole('button', { name: 'Mark Sold Out' })).not.toBeInTheDocument()
  })
})
