import { useState } from 'react';
import '../styles/auth.css';

export default function Login({ onSwitchToSignup, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Your actual signIn function from auth.js
      const { signIn } = await import('../auth');
      await signIn(email, password);
      
      const { getSession } = await import('../auth');
      const session = await getSession();
      onLoginSuccess(session);
    } catch (err) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <div className="logo">
            <img 
              src= "/logo-mark.png"
              alt= "Commectr Logo"
              className="logo-mark"
            />
            <h1 className="logo-text">Commectr</h1>
          </div>
          <p className="subtitle">Welcome back! Sign in to your account</p>
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
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
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
              onKeyPress={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
          </div>

          <button 
            className={`primary-button ${loading ? 'button-disabled' : ''}`}
            disabled={loading}
            onClick={handleSubmit}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>

        <div className="auth-footer">
          <span className="footer-text">Don't have an account?</span>
          <button className="link-button" onClick={onSwitchToSignup}>
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
