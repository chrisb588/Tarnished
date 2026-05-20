import { useState, useEffect } from "react";
import "./ListingForm.css";
import addimgicon from "../../assets/add_img_icon.svg";

/*
Quality Assurance:
1.) Make sure that discounted price is lower than original price
2.) Make sure that customer cannot enter empty data/all fields are filled

*/
export default function ListingForm({
  formData,
  setFormData,
  handleChange,
  handleFileUpload,
  existingPreviewURL = null,
}) {
  const [previewURL, setPreviewURL] = useState(null);
  const [hasDiscount, setHasDiscount] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    if (
      formData.discountedprice != null &&
      formData.discountedprice !== 0 &&
      formData.discountedprice !== -1
    ) {
      setHasDiscount(true);
    }
  }, []);

  const handleDiscountToggle = (e) => {
    const checked = e.target.checked;
    setHasDiscount(checked);
    if (!checked) {
      setFormData((prev) => ({ ...prev, discountedprice: null }));
    }
  };

  // for cleanup of memory in uploading images
  useEffect(() => {
    if (!formData.image) {
      setPreviewURL(existingPreviewURL || null);
      return;
    }

    if (!(formData.image instanceof File)) {
      setPreviewURL(formData.image); // already a URL string from existing listing
      return;
    }

    const objectUrl = URL.createObjectURL(formData.image);
    setPreviewURL(objectUrl);

    // cleanup
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [formData.image]);

  const blockInvalidChar = (e) => {
    // Prevent '-', '+', and 'e' (exponential notation)
    if (["-", "+", "e", "E"].includes(e.key)) {
      e.preventDefault();
    }
  };

  // Bug 3 fixed
  return (
    <div className="create-container">
      <div className="info-preface">
        <h4>{t("lf_photo_title")}</h4>
        <p>{t("lf_photo_sub")}</p>
      </div>
      <div className={`img-container ${previewURL ? "has-image" : "is-empty"}`}>
        <label htmlFor="image-input" style={{ cursor: "pointer" }}>
          <img src={previewURL || addimgicon} alt="Preview" />
        </label>
        <input
          type="file"
          id="image-input"
          onChange={handleFileUpload}
          accept="image/*"
          style={{ display: "none" }}
        ></input>
      </div>
      <div className="info-preface">
        <h4>{t("lf_details_title")}</h4>
        <p>{t("lf_details_sub")}</p>
      </div>
      <div className="descriptionInput">
        <label htmlFor="productName">{t("lf_product_name")}</label>
        <input
          type="text"
          name="name"
          id="productName"
          placeholder={t("lf_product_name_placeholder")}
          value={formData.name}
          onChange={handleChange}
          required
        />
        <div className="quantityDiv">
          <div className="quantityWrapper">
            <label htmlFor="quantity">{t("lf_quantity")}</label>
            <input
              type="number"
              name="quantity"
              id="quantity"
              min="0"
              placeholder="0.00"
              step="1.00"
              value={formData.quantity}
              onChange={handleChange}
              onKeyDown={blockInvalidChar}
              required
            />
          </div>
          <div className="unitWrapper">
            <label htmlFor="unit">{t("lf_unit")}</label>
            <select
              name="unit"
              id="unit"
              value={formData.unit}
              onChange={handleChange}
              required
            >
              <option value="kg">kg</option>
              <option value="lbs">lbs</option>
            </select>
          </div>
          <div className="categoryWrapper">
            <label htmlFor="type">{t("lf_product_type")}</label>
            <select
              name="type"
              id="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="vegetable">{t("lf_type_vegetable")}</option>
              <option value="fruit">{t("lf_type_fruit")}</option>
              <option value="chicken">{t("lf_type_chicken")}</option>
              <option value="pork">{t("lf_type_pork")}</option>
              <option value="beef">{t("lf_type_beef")}</option>
              <option value="seafood">{t("lf_type_seafood")}</option>
              <option value="rice">{t("lf_type_rice")}</option>
            </select>
          </div>
        </div>
      </div>
      <div className="info-preface">
        <h4>{t("lf_pricing_title")}</h4>
        <p>{t("lf_pricing_sub")}</p>
      </div>
      <div className="discountedCheck">
        <input
          type="checkbox"
          id="discountedCheck"
          checked={hasDiscount}
          onChange={handleDiscountToggle}
        />
        <label htmlFor="discountedCheck">{t("lf_has_discount")}</label>
      </div>
      <div className="priceInput">
        <div className="pricing">
          <label htmlFor="originalprice">{t("lf_original_price")}</label>
          <input
            type="number"
            value={formData.originalprice}
            onChange={handleChange}
            name="originalprice"
            id="originalprice"
            min="0"
            step="1.00"
            placeholder="0.00"
            required
          />
        </div>
        {hasDiscount && (
          <div className="pricing">
            <label htmlFor="discountedprice">{t("lf_discounted_price")}</label>
            <input
              type="number"
              name="discountedprice"
              value={formData.discountedprice ?? ""}
              onChange={handleChange}
              id="discountedprice"
              min="0"
              step="1.00"
              placeholder="0.00"
              required
            />
          </div>
        )}
      </div>

      <div className="info-preface">
        <h4>{t("lf_availability_title")}</h4>
        <p>{t("lf_availability_sub")}</p>
      </div>
      <div className="descriptionInput">
        <label htmlFor="availabilityWindow">
          {t("lf_availability_window")}
        </label>
        <select
          name="availabilityWindow"
          id="availabilityWindow"
          value={formData.availabilityWindow}
          onChange={handleChange}
          required
        >
          <option value="ends_today">{t("lf_ends_today")}</option>
          <option value="1_day">{t("lf_1_day")}</option>
          <option value="2_days">{t("lf_2_days")}</option>
          <option value="3_days">{t("lf_3_days")}</option>
        </select>
      </div>
    </div>
  );
}
