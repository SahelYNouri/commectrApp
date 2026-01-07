import { useState, useEffect } from 'react';
import { supabase, getSession, signOut } from './auth';
import Login from './components/Login';
import Signup from './components/SignUp';
import Dashboard from './components/Dashboard';
import ForgotPassword from './components/ForgotPassword';
import ResetPassword from './components/ResetPassword';

export default function App() {
  const [view, setView] = useState('login'); // 'login' | 'signup' | 'dashboard'
  const [session, setSession] = useState(null); //supabase session object, null if logged out
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for initial session
    const initSession = async () => {

      const hash = window.location.hash;
      
      // If the URL contains a recovery token, show reset password page immediately
      if (hash && hash.includes('type=recovery')) {
        setView('reset-password');
        setLoading(false);
        return; // Don't check session yet, let PASSWORD_RECOVERY event handle it
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user?.email_confirmed_at) {
        setSession(session);
        setView('dashboard');
      }
      
      setLoading(false);
    };

    initSession();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth event:', event);
      
      if (event === 'PASSWORD_RECOVERY') {
        // User clicked the reset link - show reset password form
        setView('reset-password');
      } else if (event === 'SIGNED_IN' && newSession?.user?.email_confirmed_at) {
        setSession(newSession);
        setView('dashboard');
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setView('login');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  function handleLoginSuccess(newSession) {
    if (newSession?.user?.email_confirmed_at) {
      setSession(newSession);
      setView('dashboard');
    } else {
      alert("Please verify your email before logging in.");
      signOut(); //clear unverified session
    }
  }

  async function handleLogout() {
    await signOut();
    setSession(null);
    setView('login');
  }

  function handleResetSuccess() {
    setView('login');
    setSession(null);
  }

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  //view Router
  switch (view) {
    case 'signup':
      return <Signup onSwitchToLogin={() => setView('login')} />;
    case 'forgot-password':
      return <ForgotPassword onBackToLogin={() => setView('login')} />;
    case 'reset-password':
      return <ResetPassword onResetSuccess={handleResetSuccess} />;
    case 'dashboard':
      return <Dashboard onLogout={handleLogout} />;
    default:
      return (
        <Login
          onSwitchToSignup={() => setView('signup')}
          onForgotPassword={() => setView('forgot-password')}
          onLoginSuccess={handleLoginSuccess}
        />
      );
  }
}