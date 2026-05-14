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
  const fill = selected ? '#f59e0b' : '#16a34a';
  const shadow = selected
    ? '0 0 0 3px rgba(245,158,11,0.3), 0 2px 8px rgba(0,0,0,0.4)'
    : '0 2px 6px rgba(0,0,0,0.35)';
  return L.divIcon({
    className: '',
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="36" viewBox="0 0 24 36" style="filter:drop-shadow(${shadow})">
      <path d="M12 0C5.373 0 0 5.373 0 12c0 9 12 24 12 24S24 21 24 12C24 5.373 18.627 0 12 0z" fill="${fill}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="5" fill="white"/>
    </svg>`,
    iconSize: [24, 36],
    iconAnchor: [12, 36],
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
