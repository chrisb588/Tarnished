import { Link, useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css'
import { useState } from 'react';
import MerchantDisplayAdmin from '../../components/MerchantDisplayAdmin/MerchantDisplayAdmin'

export default function AdminDashboard(){
const navigate = useNavigate();
//dummy data
const [merchants, setMerchants] = useState([
    { id: 1, name: "Pizza Palace" },
    { id: 2, name: "Tech To Go" }
]);

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
                    {merchants.map((merchant) => (
                        <MerchantDisplayAdmin key={merchant.id} merchant={merchant} />
                    ))}
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