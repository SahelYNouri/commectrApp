import { useState } from 'react';
import { updatePassword } from '../auth';
import '../styles/auth.css';

export default function ResetPassword({ onResetSuccess }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await updatePassword(password);
      
      // 3. Inform the user and send them back to login
      alert("Password updated successfully! Please sign in with your new password.");
      onResetSuccess(); 
    } catch (err) {
      setError(err.message || 'Failed to update password. Link may have expired.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <img src="/logo-mark.png" alt="Logo" className="logo-mark" />
            <h1 className="logo-text">Commectr</h1>
          </div>
          <h2 className= "logo-text">Create New Password</h2>
          <p className="subtitle">Enter a new secure password for your account</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <label className="subtitle">New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label className="subtitle">Confirm New Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit"
            className={`primary-button ${loading ? 'button-disabled' : ''}`}
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}