import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

import './AuthForm.css'

export default function AuthForm({ onSuccess, onClose }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
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
    <div>
      <form className="auth-form" onSubmit={handleSubmit}>
        <h1 className='sign-in-label'>Sign in</h1>
        <p>email address</p>
        <input
          type="email"
          placeholder="Your email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />
        <p>password</p>
        <div className="password-input-container">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Your password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="toggle-password-btn"
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                <path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                <line x1="2" y1="2" x2="22" y2="22"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        </div>
        <div className="forgot-password-container">
          <button type="button" className="forgot-password">
            forgot your password?
          </button>
        </div>

        <button disabled={loading} className="auth-buttons">
          {loading ? "Processing..." : "Log In"}
        </button>

        <button type="button" className="admin-login" onClick={() => { onClose?.(); navigate('/adminLoginPage'); }}>
          Logging in as an administrator?
        </button>
      </form>
    </div>
  );
}
