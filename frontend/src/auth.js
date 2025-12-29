import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//signup function, async function always returns a promise
export async function signUp(email, password) {

    //calls supabase singup api
  const { data, error } = await supabase.auth.signUp({
    email, 
    password,
    options: {emailRedirectTo: window.location.origin} //redirect to same page after email confirmation
  });
  if (error) throw error;
  return data;
}

//signup function
export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password }); //supabase login api
  if (error) throw error;
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

//gets current auth session if user is logged in
export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}
