import { Link, useNavigate, useParams } from 'react-router-dom';

export default function AdminDashboard(){
        return (
        <div>
            <Link to="/" className="floating-add-btn">
                <p>Back to home</p>
            </Link>
            <p>GoonOS ONLINE</p>
        </div>
    );
}