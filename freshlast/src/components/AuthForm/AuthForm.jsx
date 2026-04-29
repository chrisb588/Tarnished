import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'
import { useNavigate } from 'react-router-dom'

import './AuthForm.css'

export default function AuthForm({ onSuccess }) {
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
        <input
          type="password"
          placeholder="Your password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="forgot-password-container">
          <button type="button" className="forgot-password">
            forgot your password?
          </button>
        </div>

        <button disabled={loading} className="auth-buttons">
          {loading ? "Processing..." : "Log In"}
        </button>

        <button type="button" className="admin-login" onClick={() => navigate('/adminLoginPage')}>
          Logging in as an administrator?
        </button>
      </form>
    </div>
  );
}
