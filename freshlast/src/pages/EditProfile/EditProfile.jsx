import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import './EditProfile.css'

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export default function EditProfile({ onSave, onLogout }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    stallName: '',
    marketLocation: '',
    phoneNumber: '',
    operatingHoursStart: '05:00',
    operatingHoursEnd: '19:00',
    operatingDays: []
  })

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles')             // ← your table name
        .select('*')
        .eq('id', user.id)
        .single()

      if (data) {
        setFormData({
          stallName: data.stall_name || '',
          marketLocation: data.market_location || '',
          phoneNumber: data.phone_number || '',
          operatingHoursStart: data.operating_hours_start || '05:00',
          operatingHoursEnd: data.operating_hours_end || '19:00',
          operatingDays: data.operating_days || []
        })
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

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.stallName.trim()) return setError('Stall Name is required')
    if (!formData.marketLocation.trim()) return setError('Market Location is required')
    if (!formData.phoneNumber.trim()) return setError('Phone Number is required')
    if (formData.operatingDays.length === 0) return setError('Please select at least one operating day')

    setIsLoading(true)

    const { data: { user } } = await supabase.auth.getUser()

    const { error: dbError } = await supabase
      .from('profiles')             // ← your table name
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

    if (dbError) {
      setError(dbError.message)
      return
    }

    onSave?.()             // tell App.jsx profile is now complete
    navigate('/dashboard')
  }

  return (
    <div className="complete-profile">
      <div className="complete-profile__container">
        <h1 className="complete-profile__title">Complete your Profile</h1>

        <form className="complete-profile__form" onSubmit={handleSubmit}>
          {error && <div className="complete-profile__error">{error}</div>}

          <div className="complete-profile__field">
            <label className="complete-profile__label complete-profile__label--required" htmlFor="stallName">
              Stall Name
            </label>
            <input
              id="stallName"
              name="stallName"
              type="text"
              className="complete-profile__input"
              value={formData.stallName}
              onChange={handleChange}
            />
          </div>

          <div className="complete-profile__field">
            <label className="complete-profile__label complete-profile__label--required" htmlFor="marketLocation">
              Market Location / Section
            </label>
            <input
              id="marketLocation"
              name="marketLocation"
              type="text"
              className="complete-profile__input"
              value={formData.marketLocation}
              onChange={handleChange}
            />
          </div>

          <div className="complete-profile__field">
            <label className="complete-profile__label complete-profile__label--required" htmlFor="phoneNumber">
              Phone Number
            </label>
            <input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              className="complete-profile__input"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
          </div>

          <div className="complete-profile__field">
            <label className="complete-profile__label complete-profile__label--required">
              Operating Hours
            </label>
            <div className="complete-profile__hours">
              <input
                name="operatingHoursStart"
                type="time"
                className="complete-profile__time-input"
                value={formData.operatingHoursStart}
                onChange={handleChange}
              />
              <input
                name="operatingHoursEnd"
                type="time"
                className="complete-profile__time-input"
                value={formData.operatingHoursEnd}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="complete-profile__field">
            <label className="complete-profile__label complete-profile__label--required">
              Operating Days
            </label>
            <div className="complete-profile__days">
              {DAYS.map(day => (
                <button
                  key={day}
                  type="button"
                  className={`complete-profile__day-btn ${formData.operatingDays.includes(day) ? 'complete-profile__day-btn--active' : ''}`}
                  onClick={() => toggleDay(day)}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="complete-profile__submit"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : 'Save Profile'}
          </button>

          <button
            type="button"
            className="complete-profile__submit"
            style={{ marginTop: '8px', background: '#888' }}
            onClick={onLogout}
          >
            Sign Out
          </button>
        </form>
      </div>
    </div>
  )
}