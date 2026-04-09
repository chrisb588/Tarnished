import { Link, useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css'
import MerchantDisplayAdmin from '../../components/MerchantDisplayAdmin/MerchantDisplayAdmin'

export default function AdminDashboard(){
const navigate = useNavigate();

    return (
        <div className='container'>
            <Link to="/" className="floating-add-btn">
                <p>Back to home</p>
            </Link>
            <div
            className='dashboard'>
                <h3>Users</h3>
                <div
                className='user-list'>
                    <MerchantDisplayAdmin/>
                    <MerchantDisplayAdmin/>
                    <MerchantDisplayAdmin/>
                    <MerchantDisplayAdmin/>
                </div>
                <button
                className='add-vendor-btn'
                onClick={() => navigate('/createProfile')}>
                Create Profile
                </button>
            </div>

        </div>
    );
}