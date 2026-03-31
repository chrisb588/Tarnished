import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabaseClient";
import VendorHeader from "../../components/VendorHeader/VendorHeader";
import ProfileForm from "../../components/ProfileForm/ProfileForm";
import { createMerchant } from "../../api/admin";

export default function CreateProfile() {
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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

    if (!formData.stallName.trim()) return setError("Stall Name is required");
    if (!formData.marketLocation.trim())
      return setError("Market Location is required");
    if (!formData.phoneNumber.trim())
      return setError("Phone Number is required");
    if (formData.operatingDays.length === 0)
      return setError("Please select at least one operating day");

    setIsLoading(true);

    try {
      // Send request to create merchant endpoint
      const response = await createMerchant(
        formData.emailAddress,
        formData.stallName,
        0, // TODO: Get x coord of vendor using map marker
        0, // TODO: Get y coord of vendor using map marker
        photo,
        formData.operatingHoursStart,
        formData.operatingHoursEnd,
        formData.operatingDays,
        formData.marketLocation,
      );

      console.log(response); // TODO: Display user credentials to give to the vendor
    } catch (e) {
      setIsLoading(false);
      setError(toString(e));

      return;
    }

    setIsLoading(false);
    onSave?.();
    navigate("/dashboard");
  };

  return (
    <div className="edit-profile">
      <div className="edit-profile__container">
        <h1 className="edit-profile__title">Set Up Your Profile</h1>

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
