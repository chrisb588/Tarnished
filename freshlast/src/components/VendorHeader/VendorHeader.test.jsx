import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import VendorHeader from './VendorHeader'

describe('VendorHeader', () => {
  it('renders the logo and navigation buttons', () => {
    render(
      <MemoryRouter>
        <VendorHeader onLogout={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByText('LOGO')).toBeInTheDocument()
    expect(screen.getByTitle('Dashboard')).toBeInTheDocument()
    expect(screen.getByTitle('Profile')).toBeInTheDocument()
  })
})
