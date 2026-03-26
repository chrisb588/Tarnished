import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import VendorHeader from '../../components/VendorHeader/VendorHeader'
import './EditProfile.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function EditProfile({ onSave, onLogout }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)
  const fileInputRef = useRef(null)

  const [formData, setFormData] = useState({
    stallName: '',
    marketLocation: '',
    phoneNumber: '',
    operatingHoursStart: '',
    operatingHoursEnd: '',
    operatingDays: []
  })

  useEffect(() => {
    const fetchProfile = async () => {
      if (!supabase) return
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          stallName: data.stall_name || '',
          marketLocation: data.market_location || '',
          phoneNumber: data.phone_number || '',
          operatingHoursStart: data.operating_hours_start || '',
          operatingHoursEnd: data.operating_hours_end || '',
          operatingDays: data.operating_days || []
        })
        if (data.stall_photo) setPhotoPreview(data.stall_photo)
      }
    }
    fetchProfile()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const toggleDay = (day) => {
    setFormData(prev => ({
      ...prev,
      operatingDays: prev.operatingDays.includes(day)
        ? prev.operatingDays.filter(d => d !== day)
        : [...prev.operatingDays, day]
    }))
  }

  const handlePhotoClick = () => fileInputRef.current?.click()

  const handlePhotoChange = (e) => {
    const file = e.target.files[0]
    if (file) setPhotoPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.stallName.trim()) return setError('Stall Name is required')
    if (!formData.marketLocation.trim()) return setError('Market Location is required')
    if (!formData.phoneNumber.trim()) return setError('Phone Number is required')
    if (formData.operatingDays.length === 0) return setError('Please select at least one operating day')

    setIsLoading(true)

    if (!supabase) { setIsLoading(false); return }

    const { data: { user } } = await supabase.auth.getUser()

    const { error: dbError } = await supabase
      .from('profiles')
      .upsert({
        id: user.id,
        stall_name: formData.stallName,
        market_location: formData.marketLocation,
        phone_number: formData.phoneNumber,
        operating_hours_start: formData.operatingHoursStart,
        operating_hours_end: formData.operatingHoursEnd,
        operating_days: formData.operatingDays,
      })

    setIsLoading(false)

    if (dbError) { setError(dbError.message); return }

    onSave?.()
    navigate('/dashboard')
  }

  return (
    <div className="edit-profile">
      <VendorHeader onLogout={onLogout} />

      <div className="edit-profile__container">
        <h1 className="edit-profile__title">Set Up Your Profile</h1>
        <p className="edit-profile__subtitle">
          Review your details below. If everything looks good, just hit Save — or make any changes before continuing.
        </p>

        <form className="edit-profile__form" onSubmit={handleSubmit}>
          {error && <div className="edit-profile__error">{error}</div>}

          {/* Stall Photo */}
          <div className="edit-profile__field">
            <label className="edit-profile__label edit-profile__label--required">
              Stall Photo
            </label>
            <div className="edit-profile__photo-box" onClick={handlePhotoClick}>
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
            {isLoading ? 'Saving...' : 'Save changes'}
          </button>
        </form>
      </div>
    </div>
  )
}