import { Link, useNavigate, useParams } from 'react-router-dom';
import './AdminDashboard.css'

export default function AdminDashboard(){
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
                        <p>User 1</p>
                    </div>
                    <div
                    className='user'>
                        <p>User 1</p>
                    </div>
                    <div
                    className='user'>
                        <p>User 1</p>
                    </div>
                </div>
                <button
                className='add-vendor-btn'>
                    test
                </button>
            </div>

        </div>
    );
}