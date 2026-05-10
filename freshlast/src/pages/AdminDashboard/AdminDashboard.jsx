import { Link, useNavigate } from 'react-router-dom';
import './AdminDashboard.css'
import { useState, useEffect } from 'react';
import MerchantDisplayAdmin from '../../components/MerchantDisplayAdmin/MerchantDisplayAdmin'
import { getAllMerchants, deleteMerchant } from '../../api/admin';

export default function AdminDashboard(){
const navigate = useNavigate();
const [merchants, setMerchants] = useState([]);
const [isLoading, setIsLoading] = useState(true);
const [fetchError, setFetchError] = useState('');

useEffect(() => {
    getAllMerchants()
        .then((data) => setMerchants(data))
        .catch((err) => setFetchError(err.message ?? 'Failed to load merchants'))
        .finally(() => setIsLoading(false));
}, []);

const handleDelete = async (id) => {
    try {
        await deleteMerchant(id);
        setMerchants((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
        alert(`Delete failed: ${err.message ?? 'Unknown error'}`);
    }
};

    return (
        <div className='admin-container'>
            <Link to="/" className="floating-add-btn">
                <p>Back to home</p>
            </Link>
            <div className='admin-dashboard'>
                <h3>Users</h3>
                {isLoading && <p>Loading merchants...</p>}
                {fetchError && <p style={{ color: 'red' }}>{fetchError}</p>}
                <div className='user-list'>
                    {merchants.map((merchant) => (
                        <MerchantDisplayAdmin key={merchant.id} merchant={merchant} onDelete={handleDelete} />
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
