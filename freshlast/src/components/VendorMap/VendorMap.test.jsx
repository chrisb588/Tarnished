import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import VendorMap from './VendorMap';

vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map-container">{children}</div>,
  TileLayer: () => null,
  Marker: ({ position, eventHandlers }) => (
    <div
      data-testid="marker"
      data-lat={position[0]}
      data-lng={position[1]}
      onClick={() => eventHandlers?.click?.()}
    />
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
});
