import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import ProfileForm from './ProfileForm'

const baseFormData = {
  stallName: 'My Stall',
  marketLocation: '',
  phoneNumber: '',
  operatingHoursStart: '',
  operatingHoursEnd: '',
  operatingDays: [],
}

function ControlledProfileForm(overrides) {
  const [formData, setFormData] = useState(baseFormData)
  return (
    <ProfileForm
      isCreating={false}
      formData={formData}
      setFormData={setFormData}
      setPhoto={() => {}}
      photoPreview={null}
      setPhotoPreview={() => {}}
      error={null}
      isLoading={false}
      onSubmit={() => {}}
      {...overrides}
    />
  )
}

describe('ProfileForm', () => {
  it('renders the form fields and the submit button', () => {
    render(<ControlledProfileForm />)

    expect(screen.getByLabelText('Stall Name')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Save Profile' })).toBeInTheDocument()
  })

  it('displays the error message when an error prop is passed', () => {
    render(<ControlledProfileForm error="Stall Name is required" />)

    expect(screen.getByText('Stall Name is required')).toBeInTheDocument()
  })

  it('disables the submit button and shows Saving... when isLoading is true', () => {
    render(<ControlledProfileForm isLoading={true} />)

    const button = screen.getByRole('button', { name: 'Saving...' })
    expect(button).toBeInTheDocument()
    expect(button).toBeDisabled()
  })

  it('updates the Stall Name input value when the user types', async () => {
    const user = userEvent.setup()
    render(<ControlledProfileForm />)

    const stallNameInput = screen.getByLabelText('Stall Name')
    await user.clear(stallNameInput)
    await user.type(stallNameInput, 'Fresh Picks')

    expect(stallNameInput).toHaveValue('Fresh Picks')
  })
})
