import { useState } from 'react';
import { sendPasswordReset } from '../auth';
import '../styles/auth.css';

export default function ForgotPassword({ onBackToLogin }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email) return setError('Please enter your email address');
    
    setLoading(true);
    setError('');
    try {
      await sendPasswordReset(email);
      setSent(true);
    } catch (err) {
      setError(err.message);
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
          <h2 className= "logo-text">{sent ? 'Check your email' : 'Reset Password'}</h2>
        </div>

        {error && <div className="error-alert">{error}</div>}

        <div className="verification-msg">
          {sent ? (
            <p>We've sent a password reset link to <strong>{email}</strong>. Please check your inbox.</p>
          ) : (
            <p>Enter the email address associated with your account and we'll send you a link to reset your password.</p>
          )}
        </div>

        {!sent && (
          <div className="auth-form">
            <div className="input-group">
              <label className="label">Email Address</label>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <button 
              className={`primary-button ${loading ? 'button-disabled' : ''}`}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Sending link...' : 'Send Reset Link'}
            </button>
          </div>
        )}

        <button className="link-button" onClick={onBackToLogin} style={{ marginTop: '10px' }}>
          Back to Login
        </button>
      </div>
    </div>
  );

 
}