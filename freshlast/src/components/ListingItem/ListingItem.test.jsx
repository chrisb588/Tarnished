import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ListingItem from './ListingItem'

const mockListing = {
  id: 1,
  name: 'Fresh Cabbage',
  original_price: 50,
  discounted_price: 35,
  quantity: 10,
  unit: 'kg',
  image: null,
}

describe('ListingItem', () => {
  it('renders the listing name and prices', () => {
    render(
      <MemoryRouter>
        <ListingItem listing={mockListing} />
      </MemoryRouter>
    )

    expect(screen.getByText('Fresh Cabbage')).toBeInTheDocument()
    expect(screen.getByText('₱50')).toBeInTheDocument()
    expect(screen.getByText('₱35')).toBeInTheDocument()
  })

  it('renders updated values when given a new listing prop (no stale internal state)', () => {
    const { rerender } = render(
      <MemoryRouter>
        <ListingItem listing={mockListing} />
      </MemoryRouter>
    )

    expect(screen.getByText('Fresh Cabbage')).toBeInTheDocument()
    expect(screen.getByText('₱50')).toBeInTheDocument()

    const updatedListing = { ...mockListing, name: 'Ripe Tomatoes', original_price: 80, discounted_price: 60 }
    rerender(
      <MemoryRouter>
        <ListingItem listing={updatedListing} />
      </MemoryRouter>
    )

    expect(screen.getByText('Ripe Tomatoes')).toBeInTheDocument()
    expect(screen.getByText('₱80')).toBeInTheDocument()
    expect(screen.queryByText('Fresh Cabbage')).not.toBeInTheDocument()
  })
})
