import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import ViewMerchant from './ViewMerchant'
import { getProfile } from '../../api/profile'
import { getListingsByMerchant } from '../../api/listings'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ id: 'merchant-1' }),
  }
})

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
  },
}))

vi.mock('../../api/profile', () => ({
  getProfile: vi.fn(),
}))

vi.mock('../../api/listings', () => ({
  getListingsByMerchant: vi.fn(),
}))

vi.mock('../../components/MerchantInfo/MerchantInfo', () => ({
  default: ({ formData }) => (
    <div data-testid="merchant-info">{formData?.stallName}</div>
  ),
}))

vi.mock('../../components/ListingItem/ListingItem', () => ({
  default: ({ listing, onSelect }) => (
    <div data-testid="listing-item" onClick={() => onSelect(listing)}>
      {listing.name}
    </div>
  ),
}))

vi.mock('../../components/CategoryFilter/CategoryFilter', () => ({
  default: ({ name }) => <div data-testid="category-filter">{name}</div>,
}))

const baseMerchantProfile = {
  id: 'merchant-1',
  name: 'Test Stall',
  location: 'Central Market',
  phone_number: '09123456789',
  start_operating_time: '10:00',
  end_operating_time: '12:00',
  operating_days: ['Monday'],
  category: ['Vegetables', 'Chicken'],
  location_photo: null,
  latitude: 9.99,
  longitude: 123.45,
}

const baseListings = [
  { id: 'listing-1', name: 'Tomatoes', category: 'Vegetables' },
  { id: 'listing-2', name: 'Chicken Breast', category: 'Chicken' },
]

function renderViewMerchant() {
  return render(
    <MemoryRouter>
      <ViewMerchant />
    </MemoryRouter>
  )
}

describe('ViewMerchant renders', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getProfile.mockResolvedValue(baseMerchantProfile)
    getListingsByMerchant.mockResolvedValue(baseListings)
  })

  it('shows "Loading listings..." on initial render before data resolves', () => {
    getListingsByMerchant.mockReturnValue(new Promise(() => {}))
    renderViewMerchant()
    expect(screen.getByText('Loading listings...')).toBeInTheDocument()
  })

  it('shows "No products found" when getListingsByMerchant resolves to []', async () => {
    getListingsByMerchant.mockResolvedValue([])
    renderViewMerchant()
    await waitFor(() =>
      expect(screen.getByText('No products found')).toBeInTheDocument()
    )
  })

  it('renders listing items when listings are returned', async () => {
    renderViewMerchant()
    await waitFor(() =>
      expect(screen.getAllByTestId('listing-item')).toHaveLength(2)
    )
    const items = screen.getAllByTestId('listing-item')
    expect(items[0]).toHaveTextContent('Tomatoes')
    expect(items[1]).toHaveTextContent('Chicken Breast')
  })
})

describe('ViewMerchant back button', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getProfile.mockResolvedValue(baseMerchantProfile)
    getListingsByMerchant.mockResolvedValue(baseListings)
  })

  it('clicking "← Back" calls navigate(-1)', async () => {
    const user = userEvent.setup()
    renderViewMerchant()
    await user.click(screen.getByText("← Back"))
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})

describe('ViewMerchant listing navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getProfile.mockResolvedValue(baseMerchantProfile)
    getListingsByMerchant.mockResolvedValue(baseListings)
  })

  it('clicking a listing item calls navigate to the listing page', async () => {
    const user = userEvent.setup()
    renderViewMerchant()

    await waitFor(() =>
      expect(screen.getAllByTestId('listing-item')).toHaveLength(2)
    )

    await user.click(screen.getByText('Tomatoes'))
    expect(mockNavigate).toHaveBeenCalledWith('/viewListing/listing-1')
  })
})
