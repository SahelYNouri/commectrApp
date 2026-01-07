import { useState } from 'react';
import '../styles/auth.css';

export default function Login({ onSwitchToSignup, onLoginSuccess, onForgotPassword }) {
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
    <div className="auth-page">
      <div className="auth-layout">
        {/* LEFT: About / explainer panel */}
        <div className="about-panel">
          <div className="about-logo-wrap">
            <img
              src="/logo-mark.png"
              alt="Commectr logo"
              className="about-logo"
            />
            <div>
              <h1 className="about-title">Commectr</h1>
              <p className="about-tagline">
                Turn LinkedIn profile notes into real conversations.
              </p>
            </div>
          </div>

          <p className="about-blurb">
            Commectr helps students and early-career devs send fewer, better,
            more personal cold DMs. Paste key details from a profile, add your
            goal, and let AI draft a message that actually sounds human.
          </p>

          <ul className="about-list">
            <li>🎯 Tailored to the person&apos;s role, posts, and experience.</li>
            <li>🧪 Designed for internships, co-ops, and coffee chats.</li>
            <li>📌 Keeps a history so you know who you&apos;ve contacted.</li>
          </ul>

          <p className="about-footer-text">
            Already created an account? Make sure you&apos;ve confirmed your
            email, then sign in on the right to start sending better messages.
          </p>
        </div>

        {/* RIGHT: Login card */}
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <img
                src="/logo-mark.png"
                alt="Commectr Logo"
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
            <span className="footer-text">Don&apos;t have an account?</span>
            <button className="link-button" onClick={onSwitchToSignup}>
              Sign up
            </button>
          </div>
          <div className="footer-row">
            <button className="link-button forgot-btn" onClick={onForgotPassword}>
              Forgot password?
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

