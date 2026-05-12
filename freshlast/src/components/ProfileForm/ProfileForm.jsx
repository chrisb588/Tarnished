import { useRef, useEffect } from "react";
import "./ProfileForm.css";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const DAY_FULL_NAMES = {
  Mon: "Monday",
  Tue: "Tuesday",
  Wed: "Wednesday",
  Thu: "Thursday",
  Fri: "Friday",
  Sat: "Saturday",
  Sun: "Sunday",
};

export default function ProfileForm({
  isCreating,
  formData,
  setFormData,
  setPhoto,
  photoPreview,
  setPhotoPreview,
  error,
  isLoading,
  onSubmit,
}) {
  const fileInputRef = useRef(null);

  useEffect(() => {
    console.log("Schedule:", formData.schedule);
  }, [formData.schedule]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleScheduleTimeChange = (day, field, value) => {
    setFormData((prev) => ({
      ...prev,
      schedule: prev.schedule.map((entry) =>
        entry.day === day ? { ...entry, [field]: value } : entry
      ),
    }));
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const exists = prev.schedule.some((entry) => entry.day === day);
      return {
        ...prev,
        schedule: exists
          ? prev.schedule.filter((entry) => entry.day !== day)
          : [...prev.schedule, { day, startTime: "", endTime: "" }],
      };
    });
  };

  const allDaysSelected = DAYS.every((d) =>
    formData.schedule.some((entry) => entry.day === d)
  );

  const toggleAllDays = () => {
    setFormData((prev) => ({
      ...prev,
      schedule: allDaysSelected
        ? []
        : DAYS.map((day) => {
            const existing = prev.schedule.find((e) => e.day === day);
            return existing ?? { day, startTime: "", endTime: "" };
          }),
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  return (
    <form className="edit-profile__form" onSubmit={onSubmit}>
      {error && <div className="edit-profile__error">{error}</div>}

      {/* Added stuff if creation */}
      {isCreating && (
        <>
          <div className="edit-profile__field">
            <label
              className="edit-profile__label edit-profile__label--required"
              htmlFor="emailAddress"
            >
              Email Address
            </label>
            <input
              id="emailAddress"
              name="emailAddress"
              type="email"
              className="edit-profile__input"
              value={formData.emailAddress || ""}
              onChange={handleChange}
            />
          </div>
        </>
      )}

      {/* Stall Photo */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required">
          Stall Photo
        </label>
        <div
          className="edit-profile__photo-box"
          onClick={() => fileInputRef.current?.click()}
        >
          {photoPreview ? (
            <img
              src={photoPreview}
              alt="Stall"
              className="edit-profile__photo-preview"
            />
          ) : (
            <div className="edit-profile__photo-placeholder">
              <span className="edit-profile__photo-icon">🖼️</span>
              <span>Click to upload photo</span>
            </div>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handlePhotoChange}
        />
      </div>

      {/* Stall Name */}
      <div className="edit-profile__field">
        <label
          className="edit-profile__label edit-profile__label--required"
          htmlFor="stallName"
        >
          Stall Name
        </label>
        <input
          id="stallName"
          name="stallName"
          type="text"
          className="edit-profile__input"
          value={formData.stallName}
          onChange={handleChange}
        />
      </div>

      {/* Market Location */}
      <div className="edit-profile__field">
        <label
          className="edit-profile__label edit-profile__label--required"
          htmlFor="marketLocation"
        >
          Market Location / Section
        </label>
        <input
          id="marketLocation"
          name="marketLocation"
          type="text"
          className="edit-profile__input"
          value={formData.marketLocation}
          onChange={handleChange}
        />
      </div>

      {/* Phone Number */}
      <div className="edit-profile__field">
        <label
          className="edit-profile__label edit-profile__label--required"
          htmlFor="phoneNumber"
        >
          Phone Number
        </label>
        <input id="phoneNumber" name="phoneNumber" type="tel"
          className="edit-profile__input"
          value={formData.phoneNumber}
          onChange={handleChange}
        />
      </div>

      {/* Operating Days */}
      <div className="edit-profile__field">
        <div className="edit-profile__days-header">
          <label className="edit-profile__label edit-profile__label--required">
            Operating Days
          </label>
          <button
            type="button"
            className="edit-profile__select-all-btn"
            onClick={toggleAllDays}
          >
            {allDaysSelected ? "Unselect All" : "Select All"}
          </button>
        </div>
        <div className="edit-profile__days">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              className={`edit-profile__day-btn ${formData.schedule.some((e) => e.day === day) ? "edit-profile__day-btn--active" : ""}`}
              onClick={() => toggleDay(day)}
            >
              {day}
            </button>
          ))}
        </div>
      </div>

      {/* Per-day Operating Hours */}
      {formData.schedule.map(({ day, startTime, endTime }) => (
        <div key={day} className="edit-profile__field">
          <label className="edit-profile__label edit-profile__label--required">
            {DAY_FULL_NAMES[day]} Operating Hours
          </label>
          <div className="edit-profile__hours">
            <input
              type="time"
              className="edit-profile__time-input"
              value={startTime}
              onChange={(e) =>
                handleScheduleTimeChange(day, "startTime", e.target.value)
              }
            />
            <input
              type="time"
              className="edit-profile__time-input"
              value={endTime}
              onChange={(e) =>
                handleScheduleTimeChange(day, "endTime", e.target.value)
              }
            />
          </div>
        </div>
      ))}

      <button
        type="submit"
        className="edit-profile__submit"
        disabled={isLoading}
      >
        {isLoading
          ? isCreating
            ? "Creating..."
            : "Saving..."
          : isCreating
            ? "Create Profile"
            : "Save Profile"}
      </button>
    </form>
  );
}
