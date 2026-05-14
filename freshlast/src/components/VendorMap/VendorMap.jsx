import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import './VendorMap.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

function createPinIcon(selected) {
  return L.divIcon({
    className: '',
    html: `<div class="vendor-pin${selected ? ' vendor-pin--selected' : ''}"></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
}

function MapController({ mapRef }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
  }, [map, mapRef]);
  return null;
}

const VendorMap = forwardRef(function VendorMap(
  { merchants, userLocation, selectedMerchantId, onPinClick },
  ref
) {
  const mapInstanceRef = useRef(null);

  useImperativeHandle(ref, () => ({
    flyTo(lat, lng, zoom = 17) {
      mapInstanceRef.current?.flyTo([lat, lng], zoom);
    },
  }));

  const center = [userLocation.lat, userLocation.lng];

  return (
    <div className="vendor-map">
      <MapContainer center={center} zoom={15} style={{ height: '100%', width: '100%' }}>
        <MapController mapRef={mapInstanceRef} />
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        {merchants.map((m) => (
          <Marker
            key={m.id}
            position={[m.latitude, m.longitude]}
            icon={createPinIcon(m.id === selectedMerchantId)}
            eventHandlers={{ click: () => onPinClick(m) }}
          />
        ))}
      </MapContainer>
      <button
        className="vendor-map__recenter"
        onClick={() =>
          mapInstanceRef.current?.flyTo(center, mapInstanceRef.current.getZoom())
        }
        aria-label="Re-center map on my location"
        title="Re-center"
      >
        ⊕
      </button>
    </div>
  );
});

export default VendorMap;
