import { Link, useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css'

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
                    <div
                    className='user'>
                        <p>User 1</p>
                    </div>
                    <div
                    className='user'>
                        <p>User 2</p>
                    </div>
                    <div
                    className='user'>
                        <p>User 3</p>
                    </div>
                    <div
                    className='user'>
                        <p>User 4</p>
                    </div>
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