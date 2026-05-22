import React, { useState, useEffect } from 'react';
import './App.css';
import GameLoop from './GameLoop';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './AuthScreen'; // To be created

function App() {
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    // Initial check
    const initialSession = supabase.auth.getSession().data.session;
    setSession(initialSession);

    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>NEON AGRICORP</h1>
      </header>
      <main>
        {session ? (
          <GameLoop userId={session.user.id} /> // Pass user ID to GameLoop
        ) : (
          <AuthScreen /> // Screen for login/signup
        )}
      </main>
    </div>
  );
}

export default App;
