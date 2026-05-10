import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import './AdminLoginPage.css'



export default function AdminLoginPage(){
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate()

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);

        if (!supabase) {
        alert("Supabase not configured. Please check environment variables.");
        setLoading(false);
        return;
        }

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
        alert(error.message);
        } else {
        onSuccess?.();
        }
        setLoading(false);
    };

    return (
        <div className="admin-login-form-container">
            <button className="adminlogin-backbtn" onClick={() => navigate(-1)}>
                ← Back
            </button>
            <form className="admin-login-form" onSubmit={handleSubmit}>
                <h1 className='admin-login-label'>Sign in as Admin</h1>
                <p>email address</p>
                <input
                type="email"
                placeholder="Your email"
                value={email}
                required
                onChange={(e) => setEmail(e.target.value)}
                />
                <p>password</p>
                <input
                type="password"
                placeholder="Your password"
                value={password}
                required
                onChange={(e) => setPassword(e.target.value)}
                />            
                <button disabled={loading} className="admin-login-button">
                    {loading ? "Processing..." : "Log In"}
                </button>
            </form>
        </div>
    )
}