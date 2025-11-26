import { useState } from 'react';
import '../styles/auth.css';

export default function Signup({ onSwitchToLogin, onSignupSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const { signUp } = await import('../auth');
      await signUp(email, password);
      
      const { getSession } = await import('../auth');
      const session = await getSession();
      onSignupSuccess(session);
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <div className="logo-icon">CR</div>
            <h1 className="logo-text">Commectr</h1>
          </div>
          <p className="subtitle">Create your account to get started</p>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="auth-form">
          <div className="input-group">
            <label className="label">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label className="label">Confirm Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="input"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <button 
            className={`primary-button ${loading ? 'button-disabled' : ''}`}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </div>

        <div className="auth-footer">
          <span className="footer-text">Already have an account?</span>
          <button className="link-button" onClick={onSwitchToLogin}>
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
