import { useState, useEffect } from 'react';
import GameLoop from './GameLoop';
import { supabase } from './supabaseClient';
import { Session } from '@supabase/supabase-js';
import AuthScreen from './AuthScreen';
import { useLanguage } from './i18n';

const PROFILE_KEY = 'neon_profile';

function App() {
  const { t } = useLanguage();
  const [session, setSession] = useState<Session | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [username, setUsername] = useState('');
  const [avatarId, setAvatarId] = useState('1');

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setIsCheckingSession(false);
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsCheckingSession(false);
      if (session) {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        if (savedProfile) {
          const p = JSON.parse(savedProfile);
          setUsername(p.username);
          setAvatarId(p.avatarId);
        } else {
          setUsername(session.user.email?.split('@')[0] || 'Operator');
        }
      }
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
        <GameLoop userId={session.user.id} username={username} avatarId={avatarId} />
      ) : (
        <AuthScreen onAuth={(u, a) => {
          setUsername(u);
          setAvatarId(a);
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