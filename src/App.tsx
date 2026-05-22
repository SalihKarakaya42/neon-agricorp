import { useState, useEffect } from 'react';
import GameLoop from './GameLoop';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './AuthScreen';
import { useLanguage } from './i18n';

function App() {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isCheckingSession) {
    return (
      <div className="min-h-screen min-h-dvh bg-[#0A0A0B] flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold text-pink-400" style={{textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', animation: 'neon-flicker 5s infinite alternate'}}>
          NEON AGRICORP
        </h1>
        <p className="text-sm font-mono text-cyan-400/60">{t('app.checking')}</p>
      </div>
    );
  }

  return (
    <>
      {session ? (
        <GameLoop userId={session.user.id} />
      ) : (
        <AuthScreen onAuth={() => {
          supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setIsCheckingSession(false);
          });
        }} />
      )}
    </>
  );
}

export default App;
