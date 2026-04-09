import './MerchantDisplayAdmin.css'
import {FaRegTrashAlt, FaPencilAlt} from 'react-icons/fa'

export default function MerchantDisplayAdmin({ merchant }) {
  return (
    <div className="merchant-container">
        <div className='merchant-name'>
          <p>{merchant.name}</p>
        </div>
        <div className='button-container'>
          <button className='edit-button'><FaPencilAlt/></button>
          <button className='delete-button'><FaRegTrashAlt/></button>
        </div>
    </div>
  );
}