import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import VendorMap from './VendorMap';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Tooltip: ({ children }) => (
    <span data-testid="you-are-here-tooltip">{children}</span>
  ),
  Marker: ({ position, eventHandlers, children }) => (
    <div
      data-testid="marker"
      data-lat={position[0]}
      data-lng={position[1]}
      onClick={() => eventHandlers?.click?.()}
    >
      {children}
    </div>
  ),
  useMap: () => ({ flyTo: vi.fn(), getZoom: vi.fn(() => 15) }),
}));

vi.mock('leaflet', () => ({
  default: {
    Icon: {
      Default: { prototype: { _getIconUrl: undefined }, mergeOptions: vi.fn() },
    },
    divIcon: vi.fn(() => ({ options: { html: '' } })),
  },
}));

vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: 'x.png' }));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'x.png' }));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'x.png' }));

const merchants = [
  { id: '1', name: "Tony's Pizza", latitude: 10.32, longitude: 123.89, category: ['Food'], operating_days: [] },
  { id: '2', name: 'Boba Queen', latitude: 10.33, longitude: 123.9, category: ['Drinks'], operating_days: [] },
];

describe('VendorMap', () => {
  it('renders a marker for each merchant', () => {
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.3157, lng: 123.8854 }}
        selectedMerchantId={null}
        onPinClick={vi.fn()}
      />
    );
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
  });

  it('calls onPinClick with the correct merchant when a marker is clicked', () => {
    const onPinClick = vi.fn();
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.3157, lng: 123.8854 }}
        selectedMerchantId={null}
        onPinClick={onPinClick}
      />
    );
    fireEvent.click(screen.getAllByTestId('marker')[1]);
    expect(onPinClick).toHaveBeenCalledWith(merchants[1]);
  });

  it('renders the re-center button', () => {
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.3157, lng: 123.8854 }}
        selectedMerchantId={null}
        onPinClick={vi.fn()}
      />
    );
    expect(screen.getByRole('button', { name: /re-center/i })).toBeInTheDocument();
  });

  it('does not render the user-location tooltip when showUserLocationPin is false', () => {
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.3157, lng: 123.8854 }}
        selectedMerchantId={null}
        onPinClick={vi.fn()}
        showUserLocationPin={false}
      />
    );
    expect(screen.queryByTestId('you-are-here-tooltip')).not.toBeInTheDocument();
    expect(screen.getAllByTestId('marker')).toHaveLength(2);
  });

  it('renders user location tooltip when showUserLocationPin is true', () => {
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.318, lng: 123.88 }}
        selectedMerchantId={null}
        onPinClick={vi.fn()}
        showUserLocationPin
      />
    );
    expect(screen.getByTestId('you-are-here-tooltip')).toHaveTextContent(/you are here/i);
    expect(screen.getAllByTestId('marker')).toHaveLength(3);
    const userMarker = screen.getByTestId('you-are-here-tooltip').closest('[data-testid="marker"]');
    expect(userMarker).toHaveAttribute('data-lat', '10.318');
    expect(userMarker).toHaveAttribute('data-lng', '123.88');
  });

  it('does not call onPinClick when clicking the user location marker', () => {
    const onPinClick = vi.fn();
    render(
      <VendorMap
        merchants={merchants}
        userLocation={{ lat: 10.318, lng: 123.88 }}
        selectedMerchantId={null}
        onPinClick={onPinClick}
        showUserLocationPin
      />
    );
    fireEvent.click(screen.getByTestId('you-are-here-tooltip').closest('[data-testid="marker"]'));
    expect(onPinClick).not.toHaveBeenCalled();
  });
});
