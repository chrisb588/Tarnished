import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useNavigate } from 'react-router-dom';
import './ResetPassword.css';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  return (
    <div className='reset-pass-root-wrapper'>
      <div className='reset-pass-div'>
        <h1>Reset Password</h1>
        <p>Enter your new password below.</p>
        <form onSubmit={handleSubmit} className='reset-pass-form'>
          <label htmlFor="newpass">New Password</label>
          <input
            type="password"
            id="newpass"
            placeholder="New password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
          />
          <label htmlFor="confirmpass">Confirm Password</label>
          <input
            type="password"
            id="confirmpass"
            placeholder="Confirm password"
            value={confirm}
            required
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <p className='reset-pass-error'>{error}</p>}
          <button disabled={loading}>
            {loading ? "Saving..." : "Set New Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
