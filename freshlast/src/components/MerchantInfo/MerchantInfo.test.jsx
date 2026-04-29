import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import MerchantInfo from './MerchantInfo'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => <div data-testid="tile-layer" />,
  Marker: () => <div data-testid="map-marker" />,
}))

vi.mock('leaflet', () => {
  function Icon() { return {} }
  return { default: { Icon }, Icon }
})

const baseFormData = {
  id: 'merchant-1',
  stallName: 'Test Stall',
  marketLocation: 'Central Market',
  phoneNumber: '09123456789',
  operatingHoursStart: '10:00',
  operatingHoursEnd: '12:00',
  operatingDays: ['Monday'],
  category: 'Food',
  location_photo: null,
  coords: { lat: 9.99, lng: 123.45 },
}

function renderMerchantInfo(formData) {
  return render(<MerchantInfo formData={formData} />)
}

describe('MerchantInfo renders', () => {
  it('renders loading state when formData is null', () => {
    renderMerchantInfo(null)
    expect(screen.getByText('Loading merchant details...')).toBeInTheDocument()
  })

  it('renders the stall name, market location, and phone number', () => {
    renderMerchantInfo(baseFormData)
    expect(screen.getByText('Test Stall')).toBeInTheDocument()
    expect(screen.getByText('Central Market')).toBeInTheDocument()
    expect(screen.getByText('09123456789')).toBeInTheDocument()
  })

    it('renders stall photo when location_photo is set', () => {
    renderMerchantInfo({ ...baseFormData, location_photo: 'https://example.com/stall.jpg' })
    const img = screen.getByRole('img')
    expect(img).toBeInTheDocument()
    expect(img).toHaveAttribute('src', 'https://example.com/stall.jpg')
    })

  it('renders text "No Photo Found" when location_photo is null', () => {
    renderMerchantInfo(baseFormData)
    expect(screen.getByText('No photo found')).toBeInTheDocument()
  })
})

describe('MerchantInfo map', () => {
  it('renders the map when coords has valid lat/lng', () => {
    renderMerchantInfo(baseFormData)
    expect(screen.getByTestId('map-container')).toBeInTheDocument()
    expect(screen.getByTestId('map-marker')).toBeInTheDocument()
    expect(screen.queryByText('Location not set')).not.toBeInTheDocument()
  })

  it('renders "Location not set" when coords is null', () => {
    renderMerchantInfo({ ...baseFormData, coords: null })
    expect(screen.getByText('Location not set')).toBeInTheDocument()
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })

  it('renders "Location not set" when lat/lng are null', () => {
    renderMerchantInfo({ ...baseFormData, coords: { lat: null, lng: null } })
    expect(screen.getByText('Location not set')).toBeInTheDocument()
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })

  it('renders "Location not set" when lat/lng are 0', () => {
    renderMerchantInfo({ ...baseFormData, coords: { lat: 0, lng: 0 } })
    expect(screen.getByText('Location not set')).toBeInTheDocument()
    expect(screen.queryByTestId('map-container')).not.toBeInTheDocument()
  })
})
