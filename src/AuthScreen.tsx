import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLanguage } from './i18n';

interface AuthScreenProps { onAuth: () => void; }

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(`${t('auth.error')}: ${error.message}`);
      else onAuth();
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(`${t('auth.error')}: ${error.message}`);
      else if (data.session) onAuth();
      else setMessage(t('auth.accountCreated'));
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-dvh bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-[15%] text-center z-10">
        <h1 className="text-[1.6rem] font-bold text-pink-400 mb-1" style={{textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', animation: 'neon-flicker 5s infinite alternate'}}>
          NEON AGRICORP
        </h1>
        <p className="text-[0.7rem] font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
          {isLogin ? '● AUTHORIZE ●' : '● REGISTER ●'}
        </p>
      </div>

      <div className="glass-panel rounded-xl p-4 w-full max-w-sm mt-[25vh] z-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.email')}</label>
            <input type="email" placeholder="operator@neon.corp" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.password')}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
          </div>

          <button type="submit" disabled={isSending || !email || !password}
            className="w-full py-2 bg-[#00f3ff] text-neutral-950 font-mono text-xs font-bold uppercase rounded transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-950" style={{animation: 'pulse-dot 1s ease-in-out infinite'}} />
                {t('auth.pleaseWait')}
              </span>
            ) : isLogin ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        <button onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
          className="w-full mt-4 text-[0.7rem] font-mono text-cyan-400/60 hover:text-cyan-400 underline underline-offset-4 transition-colors cursor-pointer bg-transparent border-none">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
        </button>

        {message && (
          <div className={`mt-3 p-2 rounded border text-[0.75rem] font-mono text-center ${
            message.includes('Hesap') || message.includes('Account') ? 'border-green-500/30 bg-green-950/20 text-green-400' : 'border-red-500/30 bg-red-950/20 text-red-400'
          }`}>
            {message}
          </div>
        )}
      </div>

      <p className="fixed bottom-4 text-[0.55rem] font-mono text-cyan-400/25 tracking-widest">{'>'} v0.1 — NEON PROTOCOL</p>
    </div>
  );
};

export default AuthScreen;
