import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const DEFAULT_LAT = 10.3157;
const DEFAULT_LNG = 123.8854;

function LocationMarker({ position, onLocationChange }) {
  useMapEvents({
    click(e) {
      onLocationChange({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return position ? (
    <Marker
      position={position}
      draggable
      eventHandlers={{
        dragend(e) {
          const { lat, lng } = e.target.getLatLng();
          onLocationChange({ lat, lng });
        },
      }}
    />
  ) : null;
}

export function MapPicker({ initialLat, initialLng, onLocationChange }) {
  const hasInitial = initialLat != null && initialLat !== 0 && initialLng != null && initialLng !== 0;
  const center = [hasInitial ? initialLat : DEFAULT_LAT, hasInitial ? initialLng : DEFAULT_LNG];
  const [markerPos, setMarkerPos] = useState(hasInitial ? center : null);

  const handleLocationChange = useCallback(
    ({ lat, lng }) => {
      setMarkerPos([lat, lng]);
      onLocationChange?.({ lat, lng });
    },
    [onLocationChange]
  );

  return (
    <MapContainer center={center} zoom={15} style={{ height: '300px', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="© OpenStreetMap contributors"
      />
      <LocationMarker position={markerPos} onLocationChange={handleLocationChange} />
    </MapContainer>
  );
}
