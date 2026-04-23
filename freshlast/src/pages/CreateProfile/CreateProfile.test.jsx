import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import CreateProfile from './CreateProfile'
import { createMerchant } from '../../api/admin'

vi.mock('../../components/MapPicker', () => ({
  MapPicker: ({ onLocationChange }) => (
    <button type="button" onClick={() => onLocationChange({ lat: 9.99, lng: 123.45 })}>
      Set Location
    </button>
  ),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: null,
}))

vi.mock('../../api/admin', () => ({
  createMerchant: vi.fn().mockResolvedValue({
    data: { email: 'vendor@test.com', temp_password: 'temp123' },
  }),
}))

beforeEach(() => {
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock')
})

async function fillForm(user, container) {
  await user.type(screen.getByLabelText('Email Address'), 'vendor@test.com')

  const file = new File(['photo'], 'stall.jpg', { type: 'image/jpeg' })
  await user.upload(container.querySelector('input[type="file"]'), file)

  await user.type(screen.getByLabelText('Stall Name'), 'My Stall')
  await user.type(screen.getByLabelText('Market Location / Section'), 'Section B')
  await user.type(screen.getByLabelText('Phone Number'), '9876543210')

  await userEvent.type(container.querySelector('input[name="operatingHoursStart"]'), '08:00')
  await userEvent.type(container.querySelector('input[name="operatingHoursEnd"]'), '17:00')

  await user.click(screen.getByRole('button', { name: 'Mon' }))
}

function renderCreateProfile() {
  return render(
    <MemoryRouter>
      <CreateProfile />
    </MemoryRouter>
  )
}

describe('CreateProfile', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('sends lat/lng from MapPicker when onLocationChange fires before submit', async () => {
    const user = userEvent.setup()
    const { container } = renderCreateProfile()

    await fillForm(user, container)
    await user.click(screen.getByRole('button', { name: 'Set Location' }))
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))

    await waitFor(() => {
      expect(createMerchant).toHaveBeenCalled()
      const [, , , lat, lng] = createMerchant.mock.calls[0]
      expect(lat).toBe(9.99)
      expect(lng).toBe(123.45)
    })
  })

  it('sends 0,0 when MapPicker was never interacted with', async () => {
    const user = userEvent.setup()
    const { container } = renderCreateProfile()

    await fillForm(user, container)
    await user.click(screen.getByRole('button', { name: 'Create Profile' }))

    await waitFor(() => {
      expect(createMerchant).toHaveBeenCalled()
      const [, , , lat, lng] = createMerchant.mock.calls[0]
      expect(lat).toBe(0)
      expect(lng).toBe(0)
    })
  })
})
