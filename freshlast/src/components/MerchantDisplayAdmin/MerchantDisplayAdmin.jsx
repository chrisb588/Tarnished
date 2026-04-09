import './MerchantDisplayAdmin.css'

export default function ListingItem({ listing, showEdit = false }) {
  return (
    <div className="merchant-container">
        <div className='merchant-name'>
          <p>Test Name</p>
        </div>
        <div className='button-container'>
          <button className='edit-button'>E</button>
          <button className='delete-button'>D</button>
        </div>
    </div>
  );
}