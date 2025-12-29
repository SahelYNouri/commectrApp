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
   
    //only allow entry if email is confirmed
    const initSession = async () => {
      const s = await getSession();
      if (s && s.user && s.user.email_confirmed_at) {
        setSession(s);
        setView('dashboard');
      } else if (s) {
        // If a session exists but email isn't confirmed, clear it
        await signOut();
        setSession(null);
        setView('login');
      }
      setLoading(false);
    };

    initSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (newSession?.user?.email_confirmed_at) {
        // Only move to dashboard if user is officially confirmed
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
      />
    );
  }

  return <Dashboard onLogout={handleLogout} />;
}