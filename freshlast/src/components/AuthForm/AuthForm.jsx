import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient'

import './AuthForm.css'

export default function AuthForm({ onSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
        <p style={{ fontSize: '12px', fontWeight: 500, color: '#2d6a4f', letterSpacing: '0.08em', textTransform: 'uppercase', margin: '0 0 6px' }}>
        Welcome to Freshlast</p>
      <h1>Log In</h1>
      <form className="auth-form" onSubmit={handleSubmit}>
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
      </form>
    </div>
  );
}
