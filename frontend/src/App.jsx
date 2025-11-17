import { useState, useEffect } from 'react'
import { supabase, signIn, signUp, signOut, getSession } from './auth'
import './App.css'
import Dashboard from './Dashboard'

//handles login/signup ui and logic
function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  //cslled when form is submitted, ie login or signup button is clicked
  async function handleSubmit(e) {
    e.preventDefault(); //prevents broweser from reloading the page on form submit
    setError(""); // clears previous error msg

    try {
      if (mode === "login") {//if mode is login, calls the supabase signIn function
        await signIn(email, password);
      } else {//if we dont login then we must be signin up, so calls supabase signUp function
        await signUp(email, password);
      }

      //after signing up/in, gets the current session from supabase
      const session = await getSession();
      onAuthed(session); //calls parent callback to tell APP user is authenticated now
    } catch (err) {//if supabase throws an error, we show it in teh UI
      setError(err.message);
    }
  }

  //Login/signUp form UI
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">
          ColdConnect - {mode === "login" ? "Login" : "Sign Up"}
        </h1>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border rounded-lg px-3 py-2"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border rounded-lg px-3 py-2"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
          >
            {mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
        <button
          className="mt-4 text-sm text-blue-600 underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Need an account? Sign up" : "Already have an account? Log in"}
        </button>
      </div>
    </div>
  );
}

//main app comp
export default function App() {
  //session is equal to teh current logged in supabase session, null it not
  const [session, setSession] = useState(null);
  //session is set to loading while we check if the user is logged in or not
  const [loading, setLoading] = useState(true);

  //useEffect to check auth state runs once on mount since dependency array is empty
  useEffect(() => {
    getSession().then((s) => { //on the first load, gets the current session from supabase
      setSession(s); //then stores the session in state
      setLoading(false); //finished the loading
    });

    //everytime someonething regarding the auth state changes, supabase calls this callback function
    //onAuthStateChange returns an object with a sunscription inside
    const { data: subscription } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession); //updates the session state to new one after event
    });

    /* this is what subscription looks like rn
    {
      subscription: {
        unsubscribe: () => { ... }
      }
    }
    */
    
    return () => subscription.subscription.unsubscribe();//call unsubscribe so when the APP comp unmounts, we stop listening to auth changes
  }, []);//[] run once on mount

  //show a loading state while checking if user has a session
  if (loading) return <div className="p-8">Loading...</div>;

  //if no session, show the auth form, ie the Login/Signup form
  if (!session) {
    return <AuthForm onAuthed={setSession} />;
  }

  //load dashboard if session
  return <Dashboard onLogout={async () => { 
    await signOut(); //clears supabase session
    setSession(null); //cleear session in React state
  }} />;
}
