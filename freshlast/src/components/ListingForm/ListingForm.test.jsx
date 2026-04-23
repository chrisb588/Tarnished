import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ListingForm from './ListingForm'

const baseFormData = {
  name: '',
  quantity: '',
  unit: 'kg',
  type: 'vegetable',
  originalprice: '',
  discountedprice: '',
  image: null,
}

describe('ListingForm', () => {
  it('renders the product name input and pricing fields', () => {
    render(
      <ListingForm
        formData={baseFormData}
        setFormData={() => {}}
        handleChange={() => {}}
        handleFileUpload={() => {}}
      />
    )

    expect(screen.getByLabelText('Product Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Original Price')).toBeInTheDocument()
    expect(screen.getByLabelText('Discounted Price')).toBeInTheDocument()
  })

  it('calls handleChange when the user types in the product name input', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ListingForm
        formData={baseFormData}
        setFormData={() => {}}
        handleChange={handleChange}
        handleFileUpload={() => {}}
      />
    )

    await user.type(screen.getByLabelText('Product Name'), 'Cabbage')

    expect(handleChange).toHaveBeenCalled()
  })

  it('calls handleChange when the user changes the unit select', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ListingForm
        formData={baseFormData}
        setFormData={() => {}}
        handleChange={handleChange}
        handleFileUpload={() => {}}
      />
    )

    await user.selectOptions(screen.getByLabelText('Unit'), 'lbs')

    expect(handleChange).toHaveBeenCalled()
  })

  it('renders the availability window dropdown', () => {
    render(
      <ListingForm
        formData={{ ...baseFormData, availabilityWindow: 'ends_today' }}
        setFormData={() => {}}
        handleChange={() => {}}
        handleFileUpload={() => {}}
      />
    )
    expect(screen.getByLabelText('How long will this be available?')).toBeInTheDocument()
  })

  it('calls handleChange when the availability window select is changed', async () => {
    const user = userEvent.setup()
    const handleChange = vi.fn()

    render(
      <ListingForm
        formData={{ ...baseFormData, availabilityWindow: 'ends_today' }}
        setFormData={() => {}}
        handleChange={handleChange}
        handleFileUpload={() => {}}
      />
    )

    await user.selectOptions(screen.getByLabelText('How long will this be available?'), '1_day')
    expect(handleChange).toHaveBeenCalled()
  })
})
