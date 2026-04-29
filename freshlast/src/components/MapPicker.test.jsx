import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'
import { MapPicker } from './MapPicker'

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ position }) => (
    <div data-testid="marker" data-lat={position?.[0]} data-lng={position?.[1]} />
  ),
  useMapEvents: (handlers) => {
    // expose click handler via a button for tests that need it
    return null
  },
}))

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: {
        prototype: { _getIconUrl: undefined },
        mergeOptions: vi.fn(),
      },
    },
  },
}))

vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: 'marker-icon-2x.png' }))
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'marker-icon.png' }))
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'marker-shadow.png' }))

describe('MapPicker', () => {
  it('places the marker at initialLat/initialLng when both are non-zero', () => {
    render(<MapPicker initialLat={10.123} initialLng={123.456} onLocationChange={vi.fn()} />)

    const marker = screen.getByTestId('marker')
    expect(marker).toBeInTheDocument()
    expect(marker.dataset.lat).toBe('10.123')
    expect(marker.dataset.lng).toBe('123.456')
  })

  it('does not place a marker when initialLat/initialLng are 0', () => {
    render(<MapPicker initialLat={0} initialLng={0} onLocationChange={vi.fn()} />)

    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })

  it('does not place a marker when initialLat/initialLng are null', () => {
    render(<MapPicker initialLat={null} initialLng={null} onLocationChange={vi.fn()} />)

    expect(screen.queryByTestId('marker')).not.toBeInTheDocument()
  })
})
