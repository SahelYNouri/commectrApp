import { useState } from 'react';
import { signUp } from '../auth';
import { supabase } from '../auth';
import '../styles/auth.css';

export default function Signup({ onSwitchToLogin}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [needsVerification, setNeedsVerification] = useState(false); //tracks if verification msg is needed

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    //basic validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!email) {
      setError('Email is required');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      //signup helper from auth
      const data = await signUp(email, password);

      //Handle Duplicate Signups
      //data.user exists but identities is empty, the email is already taken
      if (data?.user && data?.user.identities?.length === 0) {
        setError('An account with this email already exists. Please log in.');
        setLoading(false);
        return;
      }

      //Success, Show the "Check your email" container
      setNeedsVerification(true);

    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.');
    } finally {
      setLoading(false);
    }

  }

  //verification Screen View
  if (needsVerification) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="logo">
              <img src="/logo-mark.png" alt="Commectr Logo" className="logo-mark" />
              <h1 className="logo-text">Commectr</h1>
            </div>
            <h2 className="logo-text">Verify your email</h2>
          </div>
          <div className="verification-msg">
            <p>We've sent a verification link to:</p>
            <p className="user-email"><strong>{email}</strong></p>
            <p>Please check your inbox and click the link to activate your account.</p>
          </div>
          <button 
            className="primary-button" 
            onClick={onSwitchToLogin}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
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
