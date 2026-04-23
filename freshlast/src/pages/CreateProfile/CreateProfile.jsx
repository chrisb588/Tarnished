import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import VendorHeader from "../../components/VendorHeader/VendorHeader";
import ProfileForm from "../../components/ProfileForm/ProfileForm";
import { createMerchant } from "../../api/admin";
import { MapPicker } from "../../components/MapPicker";

//import '../EditProfile/EditProfile.css'
import './CreateProfile.css'

export default function CreateProfile() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [location, setLocation] = useState(null);
  const [credentials, setCredentials] = useState(null) //real
  const navigate = useNavigate();


  const [formData, setFormData] = useState({
    emailAddress: "",
    password: "",
    stallName: "",
    marketLocation: "",
    phoneNumber: "",
    operatingHoursStart: "",
    operatingHoursEnd: "",
    operatingDays: [],
  });

  //use effect here
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    console.log("Submitting with Data:", formData);
    if(!formData.emailAddress.trim()) return setError('Email Address is required')
    if (!photo) return setError('Stall Photo is required')
    if (!formData.stallName.trim()) return setError('Stall Name is required')
    if (!formData.marketLocation.trim()) return setError('Market Location is required')
    if (!formData.phoneNumber.trim()) return setError('Phone Number is required')
    if (!formData.operatingHoursStart.trim() || !formData.operatingHoursEnd.trim()) return setError('Please enter your operating hours.')
    if (formData.operatingHoursStart >= formData.operatingHoursEnd) return setError('Opening time must be earlier than closing time.')
    if (formData.operatingDays.length === 0) return setError('Please select at least one operating day')


    setIsLoading(true)

    try {
      // Send request to create merchant endpoint
      const response = await createMerchant(
        formData.emailAddress,
        formData.stallName,
        formData.phoneNumber,
        location?.lat ?? 0,
        location?.lng ?? 0,
        photo,
        formData.operatingHoursStart,
        formData.operatingHoursEnd,
        formData.operatingDays,
        formData.marketLocation,
      );

      // this is what displays the user password
      console.log(response); // TODO: Display user credentials to give to the vendor

      const { email, temp_password } = response.data;

      console.log("Email:", email);
      console.log("Temp Password:", temp_password);

      setCredentials({ email, temp_password });

    } catch (e) {
      setIsLoading(false);
      setError(String(e));

      return;
    }

    setIsLoading(false);
  };

  return (
    <div className="edit-profile">
      <div className="edit-profile__container">
        <h1 className="edit-profile__title">Set Up Your Profile</h1>

        {credentials && (
          <div className="credentials-banner">
            <p>Account created! Share these credentials with the vendor:</p>
            <p><strong>Email:</strong> {credentials.email}</p>
            <p><strong>Temporary Password:</strong> {credentials.temp_password}</p>

            <button onClick={() => navigate("/admin")}>Return to Dashboard</button>
          </div>
        )}

        <div className="edit-profile__map-section">
          <MapPicker onLocationChange={setLocation} />
        </div>
        <ProfileForm
          isCreating={true}
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
