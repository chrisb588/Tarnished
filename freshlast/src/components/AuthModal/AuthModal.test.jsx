import { render, screen } from '@testing-library/react'
import AuthModal from './AuthModal'

vi.mock('../../lib/supabaseClient', () => ({ supabase: null }))

describe('AuthModal', () => {
  it('renders the sign-in form when open and nothing when closed', () => {
    const { rerender } = render(<AuthModal isOpen={true} onClose={() => {}} />)
    expect(screen.getByText('Sign In')).toBeInTheDocument()

    rerender(<AuthModal isOpen={false} onClose={() => {}} />)
    expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
  })
})
