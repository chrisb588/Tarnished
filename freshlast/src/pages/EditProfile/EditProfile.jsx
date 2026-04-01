import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import VendorHeader from '../../components/VendorHeader/VendorHeader'
import ProfileForm from '../../components/ProfileForm/ProfileForm';
import './EditProfile.css'

export default function EditProfile({ onSave, onLogout }) {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [photoPreview, setPhotoPreview] = useState(null)

  const [formData, setFormData] = useState({
    emailAddress: '',
    password: '',
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


  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    console.log("Submitting with Data:", formData);

    if (!formData.stallName.trim()) return setError('Stall Name is required')
    if (!formData.marketLocation.trim()) return setError('Market Location is required')
    if (!formData.phoneNumber.trim()) return setError('Phone Number is required') 
    if (!formData.operatingHoursStart.trim() || !formData.operatingHoursEnd.trim()) return setError('Please enter your operating hours.')
    if (formData.operatingHoursStart >= formData.operatingHoursEnd) return setError('Opening time must be earlier than closing time.');
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
        <h1 className="edit-profile__title">Edit your Profile</h1>
        {/* ... subtitle ... */}
        
        <ProfileForm 
          isCreating={false}
          formData={formData}
          setFormData={setFormData}
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