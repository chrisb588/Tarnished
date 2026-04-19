import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import EditProfile from './EditProfile'
import { updateProfile } from '../../api/profile'

vi.mock('../../components/MapPicker', () => ({
  MapPicker: ({ onLocationChange }) => (
    <button type="button" onClick={() => onLocationChange({ lat: 12.34, lng: 56.78 })}>
      Set Location
    </button>
  ),
}))

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-123' } } }),
    },
  },
}))

vi.mock('../../api/profile', () => ({
  getProfile: vi.fn().mockResolvedValue({
    data: {
      id: 'user-123',
      name: 'Test Stall',
      location: 'Market A',
      phone_number: '1234567890',
      start_operating_time: '08:00',
      end_operating_time: '17:00',
      operating_days: ['Mon'],
    },
  }),
  updateProfile: vi.fn().mockResolvedValue({ data: {} }),
}))

function renderEditProfile() {
  return render(
    <MemoryRouter>
      <EditProfile onSave={vi.fn()} onLogout={vi.fn()} />
    </MemoryRouter>
  )
}

describe('EditProfile', () => {
  beforeEach(() => { vi.clearAllMocks() })
  it('sends lat/lng from MapPicker when onLocationChange fires before submit', async () => {
    const user = userEvent.setup()
    renderEditProfile()

    await waitFor(() => expect(screen.getByDisplayValue('Test Stall')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Set Location' }))
    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled()
      const [, , lat, lng] = updateProfile.mock.calls[0]
      expect(lat).toBe(12.34)
      expect(lng).toBe(56.78)
    })
  })

  it('sends 0,0 when MapPicker was never interacted with', async () => {
    const user = userEvent.setup()
    renderEditProfile()

    await waitFor(() => expect(screen.getByDisplayValue('Test Stall')).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: 'Save Profile' }))

    await waitFor(() => {
      expect(updateProfile).toHaveBeenCalled()
      const [, , lat, lng] = updateProfile.mock.calls[0]
      expect(lat).toBe(0)
      expect(lng).toBe(0)
    })
  })
})
