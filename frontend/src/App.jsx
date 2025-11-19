import { useState, useEffect } from 'react';
import { supabase, getSession, signOut } from './auth';
import Login from './components/Login';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'dashboard'
  const [session, setSession] = useState(null); //supabase session object, null if logged out
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    getSession().then((s) => {
      setSession(s);
      if (s) {
        setView('dashboard');
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setView(newSession ? 'dashboard' : 'login');
    });

    return () => subscription.subscription.unsubscribe();
  }, []);

  function handleLoginSuccess(session) {
    setSession(session);
    setView('dashboard');
  }

  function handleSignupSuccess(session) {
    setSession(session);
    setView('dashboard');
  }

  async function handleLogout() {
    await signOut();
    setSession(null);
    setView('login');
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (view === 'login') {
    return (
      <Login
        onSwitchToSignup={() => setView('signup')}
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  if (view === 'signup') {
    return (
      <Signup
        onSwitchToLogin={() => setView('login')}
        onSignupSuccess={handleSignupSuccess}
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}