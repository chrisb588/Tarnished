import "./MerchantInfo.css";
import { useState } from "react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import { useLanguage } from "../../context/languageContext";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

export default function MerchantInfo({ formData }) {
  const { t } = useLanguage();

  if (!formData) {
    return <div>{t("mi_loading")}</div>;
  }

  const {
    id,
    stallName,
    marketLocation,
    phoneNumber,
    operatingHoursStart,
    operatingHoursEnd,
    operatingDays,
    category,
    location_photo,
    coords,
  } = formData;

  return (
    <div className="merchantinfo-container">
      <h3 className="merchantinfo-name">{stallName}</h3>
      <div className="merchantinfo-photo">
        {location_photo ? (
          <img src={location_photo} alt="Stall" />
        ) : (
          <p>{t("mi_no_photo")}</p>
        )}
      </div>
      <div className="merchantinfo-general">
        <div className="general-div">
          <span className="merchantinfo-label">{t("mi_market_location")}</span>
          <span className="merchantinfo-answer">{marketLocation}</span>
        </div>
        <div className="general-div">
          <span className="merchantinfo-label">{t("mi_contact")}</span>
          <span className="merchantinfo-answer">{phoneNumber}</span>
        </div>
        <div className="general-div">
          <span className="merchantinfo-label">{t("vm_schedule")}</span>
        </div>
        <div className="merchantinfo-schedule">
          {/* !! Remove hardcoded schedule with actual schedule */}
          <div className="hours-container">
            <p>Monday:</p>
            <p>10PM-12AM</p>
            <p>Tuesday:</p>
            <p>CLOSED</p>
            <p>Wednesday:</p>
            <p>CLOSED</p>
            <p>Thursday:</p>
            <p>CLOSED</p>
          </div>
          <div className="hours-container">
            <p>Friday:</p>
            <p>10PM-12AM</p>
            <p>Saturday:</p>
            <p>10PM-12AM</p>
            <p>Sunday:</p>
            <p>10PM-12AM</p>
            <br></br>
          </div>
        </div>
      </div>
      <h3 className="merchantinfo-name">{t("mi_stall_location")}</h3>

      <div className="merchantinfo-photo">
        {coords?.lat && coords?.lng && coords.lat !== 0 && coords.lng !== 0 ? (
          <MapContainer
            center={[coords.lat, coords.lng]}
            zoom={17}
            style={{ width: "100%", height: "300px" }}
            attributionControl={true}
            dragging={false}
            scrollWheelZoom={false}
            doubleClickZoom={false}
            zoomControl={false}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="© OpenStreetMap contributors"
            />
            <Marker position={[coords.lat, coords.lng]} icon={markerIcon} />
          </MapContainer>
        ) : (
          <p className="view-listing-status">{t("vl_location_not_set")}</p>
        )}
      </div>
    </div>
  );
}
