import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import AuthForm from './AuthForm'

vi.mock('../../lib/supabaseClient', () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn().mockResolvedValue({ error: null })
    }
  }
}))

import { supabase } from '../../lib/supabaseClient';

describe('AuthForm', () => {
  beforeEach(() => {
    supabase.auth.signInWithPassword.mockResolvedValue({ error: null })
  })

  it('renders the email input, password input, and login button', () => {
    render(<AuthForm />)

    expect(screen.getByPlaceholderText('Your email')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Your password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Log In' })).toBeInTheDocument()
  })

  it('calls signInWithPassword with the entered email and password', async () => {
    const user = userEvent.setup()

    render(<AuthForm />)

    await user.type(screen.getByPlaceholderText('Your email'), 'testemail123@gmail.com')
    await user.type(screen.getByPlaceholderText('Your password'), 'testpassword123')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledOnce()
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'testemail123@gmail.com',
      password: 'testpassword123',
    })
  })

  it('calls onSuccess when sign-in succeeds', async () => {
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<AuthForm onSuccess={onSuccess} />)

    await user.type(screen.getByPlaceholderText('Your email'), 'testemail123@gmail.com')
    await user.type(screen.getByPlaceholderText('Your password'), 'testpassword123')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(onSuccess).toHaveBeenCalledOnce()
  })

  it('does not call onSuccess when sign-in fails', async () => {
    supabase.auth.signInWithPassword.mockResolvedValueOnce({ error: { message: 'Invalid credentials' } })
    const user = userEvent.setup()
    const onSuccess = vi.fn()

    render(<AuthForm onSuccess={onSuccess} />)

    await user.type(screen.getByPlaceholderText('Your email'), 'testemail123@gmail.com')
    await user.type(screen.getByPlaceholderText('Your password'), 'wrongpassword')
    await user.click(screen.getByRole('button', { name: 'Log In' }))

    expect(onSuccess).not.toHaveBeenCalled()
  })
})
