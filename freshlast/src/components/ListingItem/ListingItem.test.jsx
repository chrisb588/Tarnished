import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import ListingItem from './ListingItem'

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

describe('ListingItem', () => {
  it('renders the listing name and prices', () => {
    render(
      <MemoryRouter>
        <ListingItem listing={baseListing} />
      </MemoryRouter>
    )
    expect(screen.getByText('Fresh Cabbage')).toBeInTheDocument()
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(screen.getByText('₱35')).toBeInTheDocument()
  })

  it('renders updated values when given a new listing prop (no stale internal state)', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ListingItem listing={baseListing} />
      </MemoryRouter>
    )

    const updatedListing = { ...baseListing, name: 'Ripe Tomatoes', original_price: 80, discounted_price: 60 }
    rerender(
      <MemoryRouter>
        <ListingItem listing={updatedListing} />
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
    render(<MemoryRouter><ListingItem listing={listing} /></MemoryRouter>)
    expect(screen.getByText('3h left')).toBeInTheDocument()
  })

  it('shows a countdown in days when expires_at is more than 24 hours away', () => {
    const listing = {
      ...baseListing,
      expires_at: new Date(Date.now() + 49 * 60 * 60 * 1000).toISOString(),
    }
    render(<MemoryRouter><ListingItem listing={listing} /></MemoryRouter>)
    expect(screen.getByText('3d left')).toBeInTheDocument()
  })

  it('does not show a countdown when expires_at is null', () => {
    render(<MemoryRouter><ListingItem listing={baseListing} /></MemoryRouter>)
    expect(screen.queryByText(/Expires in/)).not.toBeInTheDocument()
  })

  it('shows original price as main price without strikethrough when discounted_price is 0', () => {
    const { container } = render(
      <MemoryRouter>
        <ListingItem listing={{ ...baseListing, discounted_price: 0 }} />
      </MemoryRouter>
    )
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(screen.queryByText('₱35')).not.toBeInTheDocument()
    expect(container.querySelector('.listing-card__price-original')).not.toBeInTheDocument()
  })

  it('shows original price as main price without strikethrough when discounted_price is null', () => {
    const { container } = render(
      <MemoryRouter>
        <ListingItem listing={{ ...baseListing, discounted_price: null }} />
      </MemoryRouter>
    )
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(container.querySelector('.listing-card__price-original')).not.toBeInTheDocument()
  })

  it('applies sold-out class when is_sold_out is true', () => {
    const listing = { ...baseListing, is_sold_out: true }
    const { container } = render(<MemoryRouter><ListingItem listing={listing} /></MemoryRouter>)
    expect(container.querySelector('.listing-card--sold-out')).toBeInTheDocument()
  })

  it('does not apply sold-out class when is_sold_out is false', () => {
    const { container } = render(<MemoryRouter><ListingItem listing={baseListing} /></MemoryRouter>)
    expect(container.querySelector('.listing-card--sold-out')).not.toBeInTheDocument()
  })

  it('shows Mark Sold Out button when showEdit is true and onSoldOut is provided', () => {
    render(
      <MemoryRouter>
        <ListingItem listing={baseListing} showEdit={true} onSoldOut={() => {}} />
      </MemoryRouter>
    )
    expect(screen.getByRole('button', { name: 'Mark Sold Out' })).toBeInTheDocument()
  })

  it('calls onSoldOut with the listing when Mark Sold Out button is clicked', async () => {
    const user = userEvent.setup()
    const onSoldOut = vi.fn()
    render(
      <MemoryRouter>
        <ListingItem listing={baseListing} showEdit={true} onSoldOut={onSoldOut} />
      </MemoryRouter>
    )
    await user.click(screen.getByRole('button', { name: 'Mark Sold Out' }))
    expect(onSoldOut).toHaveBeenCalledWith(baseListing)
  })

  it('does not show Mark Sold Out button when showEdit is false', () => {
    render(<MemoryRouter><ListingItem listing={baseListing} showEdit={false} /></MemoryRouter>)
    expect(screen.queryByRole('button', { name: 'Mark Sold Out' })).not.toBeInTheDocument()
  })
})
