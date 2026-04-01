import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import VendorHeader from '../../components/VendorHeader/VendorHeader'
import ProfileForm from '../../components/ProfileForm/ProfileForm';


export default function CreateProfile() {
  const [photoPreview, setPhotoPreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    emailAddress: '',
    password: 'example',
    stallName: '',
    marketLocation: '',
    phoneNumber: '',
    operatingHoursStart: '',
    operatingHoursEnd: '',
    operatingDays: []
  })

  //use effect here
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    console.log("Submitting with Data:", formData);
    if(!formData.emailAddress.trim()) return setError('Email Address is required')
    if (!formData.stallName.trim()) return setError('Stall Name is required')
    if (!formData.marketLocation.trim()) return setError('Market Location is required')
    if (!formData.phoneNumber.trim()) return setError('Phone Number is required') 
    if (!formData.operatingHoursStart.trim() || !formData.operatingHoursEnd.trim()) return setError('Please enter your operating hours.')
    if (formData.operatingHoursStart >= formData.operatingHoursEnd) return setError('Opening time must be earlier than closing time.')
    if (formData.operatingDays.length === 0) return setError('Please select at least one operating day')
    
    /*
    setIsLoading(true)

    if (!supabase) { setIsLoading(false); return }


    //auth, signs up
    const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.emailAddress,
        password: formData.password,
      })

      if (authError) {
        setIsLoading(false)
        return setError(authError.message)
      }

    const user = authData.user


    //puts the stuff in the forms
    if (user) {
      const { error: dbError } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          stall_name: formData.stallName,
          market_location: formData.marketLocation,
          phone_number: formData.phoneNumber,
          operating_hours_start: formData.operatingHoursStart,
          operating_hours_end: formData.operatingHoursEnd,
          operating_days: formData.operatingDays,
        })


      if (dbError) {
        setIsLoading(false)
        return setError(dbError.message)
      }
    }

    
    setIsLoading(false)
    onSave?.()
    navigate('/dashboard')
    */
  }

  return (
    <div className="edit-profile">
      <div className="edit-profile__container">
        <h1 className="edit-profile__title">Set Up Your Profile</h1>
        
        <ProfileForm 
          isCreating={true}
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