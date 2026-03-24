import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

import './ChangePassword.css'

export default function ChangePassword() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      alert("Passwords do not match.");
      return;
    }
    setLoading(true);
    const { error } = await supabase.auth.updateUser({
      password,
      data: { password_changed: true },
    });
    if (error) {
      alert(error.message);
    }
    setLoading(false);
  };

  return (
    <div
    className='password-div'>
      <h1>Set Your Password</h1>
      <p>This is your first login. Please set a new password before continuing.</p>
      <form onSubmit={handleSubmit}
      className='change-pass-form'>
        <p>new password</p>
        <input
          type="password"
          placeholder="New password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />
        <p>confirm password</p>
        <input
          type="password"
          placeholder="Confirm password"
          value={confirm}
          required
          onChange={(e) => setConfirm(e.target.value)}
        />
        <button disabled={loading}>
          {loading ? "Saving..." : "Set Password"}
        </button>
      </form>
    </div>
  );
}
