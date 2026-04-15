import './MerchantDisplayAdmin.css'
import { useNavigate } from 'react-router-dom'
import {FaRegTrashAlt, FaPencilAlt} from 'react-icons/fa'

export default function MerchantDisplayAdmin({ merchant, onDelete }) {
  const navigate = useNavigate();

  return (
    <div className="merchant-container">
        <div className='merchant-name'>
          <p>{merchant.name}</p>
        </div>
        <div className='button-container'>
          <button className='edit-button' onClick={() => navigate(`/editProfile/${merchant.id}`)}><FaPencilAlt/></button>
          <button className='delete-button' onClick={() => onDelete(merchant.id)}><FaRegTrashAlt/></button>
        </div>
    </div>
  );
}