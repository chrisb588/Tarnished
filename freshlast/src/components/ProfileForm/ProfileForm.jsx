import { useRef } from 'react';
import './ProfileForm.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function ProfileForm({ 
  isCreating,
  formData, 
  setFormData, 
  photoPreview, 
  setPhotoPreview, 
  error, 
  isLoading, 
  onSubmit 
}) {
  const fileInputRef = useRef(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) setPhotoPreview(URL.createObjectURL(file));
  };

  return (
    <form className="edit-profile__form" onSubmit={onSubmit}>
      {error && <div className="edit-profile__error">{error}</div>}

      {/* Added stuff if creation */}
      {isCreating && (
        <>
          <div className="edit-profile__field">
            <label className="edit-profile__label edit-profile__label--required" htmlFor="emailAddress">
              Email Address
            </label>
            <input id="emailAddress" name="emailAddress" type="email"
              className="edit-profile__input"
              value={formData.emailAddress || ''} 
              onChange={handleChange} />
          </div>
          <div className="edit-profile__field">
            <label className="edit-profile__label edit-profile__label--required" htmlFor="password">
              Password
            </label>
            <input id="password" name="password" type="password"
              className="edit-profile__input"
              value={formData.password || ''} 
              onChange={handleChange} />
          </div>
        </>
      )}

      {/* Stall Photo */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required">
          Stall Photo
        </label>
        <div className="edit-profile__photo-box" onClick={() => fileInputRef.current?.click()}>
          {photoPreview ? (
            <img src={photoPreview} alt="Stall" className="edit-profile__photo-preview" />
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
          style={{ display: 'none' }}
          onChange={handlePhotoChange}
        />
      </div>

      {/* Stall Name */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required" htmlFor="stallName">
          Stall Name
        </label>
        <input id="stallName" name="stallName" type="text"
          className="edit-profile__input"
          value={formData.stallName} onChange={handleChange} />
      </div>

      {/* Market Location */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required" htmlFor="marketLocation">
          Market Location / Section
        </label>
        <input id="marketLocation" name="marketLocation" type="text"
          className="edit-profile__input"
          value={formData.marketLocation} onChange={handleChange} />
      </div>

      {/* Phone Number */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required" htmlFor="phoneNumber">
          Phone Number
        </label>
        <input id="phoneNumber" name="phoneNumber" type="tel"
          className="edit-profile__input"
          value={formData.phoneNumber} onChange={handleChange} />
      </div>

      {/* Operating Hours */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required">
          Operating Hours
        </label>
        <div className="edit-profile__hours">
          <input name="operatingHoursStart" type="time"
            className="edit-profile__time-input"
            value={formData.operatingHoursStart} onChange={handleChange} />
          <input name="operatingHoursEnd" type="time"
            className="edit-profile__time-input"
            value={formData.operatingHoursEnd} onChange={handleChange} />
        </div>
      </div>

      {/* Operating Days */}
      <div className="edit-profile__field">
        <label className="edit-profile__label edit-profile__label--required">
          Operating Days
        </label>
        <div className="edit-profile__days">
          {DAYS.map(day => (
            <button key={day} type="button"
              className={`edit-profile__day-btn ${formData.operatingDays.includes(day) ? 'edit-profile__day-btn--active' : ''}`}
              onClick={() => toggleDay(day)}>
              {day}
            </button>
          ))}
        </div>
      </div>

      <button type="submit" className="edit-profile__submit" disabled={isLoading}>
        {isLoading 
        ? (isCreating ? 'Creating...' : 'Saving...')
        : (isCreating ? 'Create Profile' : "Save Profile")
        }
      </button>
    </form>
  );
}