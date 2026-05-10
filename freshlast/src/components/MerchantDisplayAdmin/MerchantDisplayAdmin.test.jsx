import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MerchantDisplayAdmin from './MerchantDisplayAdmin'

const mockMerchant = { id: 42, name: 'Aling Nena' }

describe('MerchantDisplayAdmin', () => {
  it('renders the merchant name with edit and delete buttons', () => {
    render(
      <MemoryRouter>
        <MerchantDisplayAdmin merchant={mockMerchant} onDelete={() => {}} />
      </MemoryRouter>
    )

    expect(screen.getByText('Aling Nena')).toBeInTheDocument()
    const buttons = screen.getAllByRole('button')
    expect(buttons).toHaveLength(2)
  })
})
