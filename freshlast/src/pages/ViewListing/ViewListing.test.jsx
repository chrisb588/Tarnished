import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { vi } from 'vitest'
import ViewListing from './ViewListing'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="map-marker" />,
}))

vi.mock('leaflet', () => {
  function Icon() { return {} }
  return { default: { Icon }, Icon }
})

vi.mock('../../api/listings', () => ({
  getListingById: vi.fn(),
}))

vi.mock('../../api/profile', () => ({
  getProfile: vi.fn(),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
    },
  },
}))

import { getListingById } from '../../api/listings'
import { getProfile } from '../../api/profile'

const baseListing = { id: '1', name: 'Test Item', type: 'Food', quantity: 5, unit: 'kg', original_price: 100, discounted_price: 80, merchant: 'merchant-1', image: null }

function renderViewListing() {
  return render(
    <MemoryRouter initialEntries={['/viewListing/1']}>
      <Routes>
        <Route path="/viewListing/:id" element={<ViewListing />} />
      </Routes>
    </MemoryRouter>
  )
}

describe('ViewListing map', () => {
  beforeEach(() => { vi.clearAllMocks() })

  it('renders the map when merchant has valid lat/lng', async () => {
    getListingById.mockResolvedValue(baseListing)
    getProfile.mockResolvedValue({ name: 'Test Merchant', latitude: 9.99, longitude: 123.45, location_photo: null })

    renderViewListing()

    await waitFor(() => {
      expect(screen.getByTestId('map-container')).toBeInTheDocument()
      expect(screen.getByTestId('map-marker')).toBeInTheDocument()
    })
    expect(screen.queryByText('Location not set')).not.toBeInTheDocument()
  })

  it('renders "Location not set" when lat/lng are null', async () => {
    getListingById.mockResolvedValue(baseListing)
    getProfile.mockResolvedValue({ name: 'Test Merchant', latitude: null, longitude: null, location_photo: null })

    renderViewListing()

    await waitFor(() => {
      expect(screen.getByText('Location not set')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })

  it('renders "Location not set" when lat/lng are 0', async () => {
    getListingById.mockResolvedValue(baseListing)
    getProfile.mockResolvedValue({ name: 'Test Merchant', latitude: 0, longitude: 0, location_photo: null })

    renderViewListing()

    await waitFor(() => {
      expect(screen.getByText('Location not set')).toBeInTheDocument()
    })
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })
})
