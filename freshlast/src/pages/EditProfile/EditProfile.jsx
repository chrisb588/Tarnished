import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import VendorHeader from "../../components/VendorHeader/VendorHeader";
import ProfileForm from "../../components/ProfileForm/ProfileForm";
import "./EditProfile.css";
import { getProfile, updateProfile } from "../../api/profile";
import { MapPicker } from "../../components/MapPicker";

export default function EditProfile({ onSave, onLogout }) {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [location, setLocation] = useState({ lat: 0, lng: 0 });

  const [formData, setFormData] = useState({
    id: "",
    emailAddress: "", // TODO: Pls remove this
    password: "", // TODO: Pls remove this
    stallName: "",
    marketLocation: "",
    phoneNumber: "",
    operatingHoursStart: "",
    operatingHoursEnd: "",
    operatingDays: [],
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return;
      let userId = paramId;
      if (!userId) {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) { setError("User details cannot be retrieved"); return; }
        userId = user.id;
      }

      const response = await getProfile(userId);
      const data = response.data;

      if (data) {
        setFormData({
          id: data.id || "",
          stallName: data.name || "",
          marketLocation: data.location || "",
          phoneNumber: data.phone_number || "",
          operatingHoursStart: data.start_operating_time || "",
          operatingHoursEnd: data.end_operating_time || "",
          operatingDays: data.operating_days || [],
        });
        if (data.location_photo) setPhotoPreview(data.location_photo);
      }
    };
    fetchProfile();
  }, [paramId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting with Data:", formData);

    if (!formData.stallName.trim()) return setError("Stall Name is required");
    if (!formData.marketLocation.trim())
      return setError("Market Location is required");
    if (!formData.phoneNumber.trim())
      return setError("Phone Number is required");
    if (
      !formData.operatingHoursStart.trim() ||
      !formData.operatingHoursEnd.trim()
    )
      return setError("Please enter your operating hours.");
    if (formData.operatingHoursStart >= formData.operatingHoursEnd)
      return setError("Opening time must be earlier than closing time.");
    if (formData.operatingDays.length === 0)
      return setError("Please select at least one operating day");

    setIsLoading(true);

    if (!supabase) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);

    try {
      // Send request to update profile endpoint
      const response = await updateProfile(
        formData.id,
        formData.stallName,
        location.lat,
        location.lng,
        photo,
        formData.operatingHoursStart,
        formData.operatingHoursEnd,
        formData.operatingDays,
        formData.marketLocation,
      );

      console.log(response);
    } catch (e) {
      setError(toString(e));
      return;
    }

    setIsLoading(false);

    onSave?.();
    navigate(paramId ? "/admin" : "/dashboard");
  };

  return (
    <div className="edit-profile">
      <VendorHeader onLogout={onLogout} />
      <div className="edit-profile__container">
        <h1 className="edit-profile__title">Edit your Profile</h1>
        {/* ... subtitle ... */}

        <MapPicker onLocationChange={setLocation} />
        <ProfileForm
          isCreating={false}
          formData={formData}
          setFormData={setFormData}
          setPhoto={setPhoto}
          photoPreview={photoPreview}
          setPhotoPreview={setPhotoPreview}
          error={error}
          isLoading={isLoading}
          onSubmit={handleSubmit}
        />
      </div>
    </div>
  );
}
