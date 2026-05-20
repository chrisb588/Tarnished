import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import ListingForm from "../../components/ListingForm/ListingForm";
import { supabase } from "../../lib/supabaseClient";
import {
  createListing,
  updateListing,
  deleteListing,
  getListingById,
} from "../../api/listings";

import "./CreateListing.css";
import { useLanguage } from "../../context/languageContext";

function getWindowFromExpiresAt(expiresAt) {
  if (!expiresAt) return "ends_today";
  const hours = (new Date(expiresAt) - new Date()) / (1000 * 60 * 60);
  if (hours <= 24) return "ends_today";
  if (hours <= 48) return "1_day";
  if (hours <= 72) return "2_days";
  return "3_days";
}

function calculateExpiresAt(window) {
  const now = new Date();
  switch (window) {
    case "ends_today": {
      const endOfDay = new Date(now);
      endOfDay.setHours(23, 59, 59, 999);
      return endOfDay.toISOString();
    }
    case "1_day":
      return new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
    case "2_days":
      return new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString();
    case "3_days":
      return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString();
    default:
      return null;
  }
}

const validateForm = (formData, t) => {
  console.log(formData);
  const requiredFields = ["name", "quantity", "unit", "originalprice", "image"];
  const isMissingFields = requiredFields.some(
    (field) => formData[field] === "" || formData[field] === null,
  );

  if (Number(formData.quantity) == 0) {
    alert(t("quantity_zero"));
    return false;
  }

  if (Number(formData.originalprice) == 0) {
    alert(t("price_zero"));
    return false;
  }

  if (
    formData.discountedprice !== null &&
    Number(formData.discountedprice) >= Number(formData.originalprice)
  ) {
    alert(t("discounted_price_invalid"));
    return false;
  }

  if (isMissingFields) {
    alert(t("fields_required"));
    return false;
  }

  return true;
};

export default function CreateListing() {
  const { id } = useParams();
  const isCreating = !id;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    image: null,
    name: "",
    quantity: null,
    unit: "kg",
    type: "vegetable",
    originalprice: null,
    discountedprice: null,
    availabilityWindow: "ends_today",
  });

  const [merchantId, setMerchantId] = useState(null);
  const [existingImagePath, setExistingImagePath] = useState(null);

  useEffect(() => {
    const init = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) setMerchantId(user.id);

      if (id) {
        const listing = await getListingById(id);
        if (listing) {
          setFormData({
            name: listing.name,
            quantity: listing.quantity,
            unit: listing.unit,
            type: listing.type ?? "vegetable",
            originalprice: listing.original_price,
            discountedprice: listing.discounted_price,
            image: listing.image,
            availabilityWindow: getWindowFromExpiresAt(listing.expires_at),
          });
          setExistingImagePath(listing.image);
        }
      }
    };
    init();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    let finalValue = value;

    if (type === "number") {
      finalValue = value === "" ? "" : parseFloat(value);

      if (finalValue < 0) finalValue = 0;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: finalValue,
    }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm(formData)) return;

    setIsSubmitting(true);
    try {
      const expiresAt = calculateExpiresAt(formData.availabilityWindow);

      if (isCreating) {
        await createListing(
          merchantId,
          formData.name,
          formData.originalprice,
          formData.discountedprice,
          formData.image,
          formData.unit,
          formData.quantity,
          formData.type,
          expiresAt,
        );
      } else {
        await updateListing(
          id,
          merchantId,
          formData.name,
          formData.originalprice,
          formData.discountedprice,
          formData.image instanceof File ? formData.image : existingImagePath,
          formData.unit,
          formData.quantity,
          formData.type,
          expiresAt,
        );
      }
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed:", error.message);
      alert(t("error_prefix") + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!confirm(t("confirm_delete_listing"))) return;
    await deleteListing(id);
    navigate("/dashboard");
  };

  return (
    <div className="main-container">
      <form className="main-body">
        <Link to="/dashboard" className="back-button">
          <p>{t("back")}</p>
        </Link>

        <div className="create-preface">
          <h1>{t("create_listing_title")}</h1>
          <p>{t("create_listing_sub")}</p>
        </div>

        <ListingForm
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
          handleFileUpload={handleFileUpload}
        />

        {isCreating ? (
          <div className="button-div">
            <button className="create-button" onClick={handleSubmit}>
              {t("create_listing_btn")}
            </button>
          </div>
        ) : (
          <>
            <div className="button-div">
              <button className="save-edit-button" onClick={handleSubmit}>
                {t("save_listing_btn")}
              </button>
              <button className="delete-button" onClick={handleDelete}>
                {t("delete_listing_btn")}
              </button>
            </div>
          </>
        )}
      </form>
    </div>
  );
}
