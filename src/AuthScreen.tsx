import { useState } from 'react';
import { supabase } from './supabaseClient';
import { useLanguage } from './i18n';

interface AuthScreenProps { onAuth: (username: string, avatarId: string) => void; }

const AVATAR_COUNT = 20;
const PROFILE_KEY = 'neon_profile';

const AuthScreen: React.FC<AuthScreenProps> = ({ onAuth }) => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');

    if (!isLogin && password !== confirmPassword) {
      setMessage(t('auth.passwordMismatch'));
      setIsSending(false);
      return;
    }

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(`${t('auth.error')}: ${error.message}`);
      else {
        const savedProfile = localStorage.getItem(PROFILE_KEY);
        const profile = savedProfile ? JSON.parse(savedProfile) : { username: email.split('@')[0], avatarId: '1' };
        onAuth(profile.username, profile.avatarId);
      }
    } else {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username, avatar_id: selectedAvatar } },
      });
      if (error) setMessage(`${t('auth.error')}: ${error.message}`);
      else if (data.session) {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ username, avatarId: selectedAvatar }));
        onAuth(username, selectedAvatar);
      } else {
        localStorage.setItem(PROFILE_KEY, JSON.stringify({ username, avatarId: selectedAvatar }));
        setMessage(t('auth.accountCreated'));
      }
    }
    setIsSending(false);
  };

  return (
    <div className="min-h-dvh bg-[#0A0A0B] flex flex-col items-center justify-center p-4 relative">
      <div className="absolute top-[8%] text-center z-10">
        <h1 className="text-[1.6rem] font-bold text-pink-400 mb-1" style={{textShadow: '0 0 10px #ff00ff, 0 0 20px #ff00ff', animation: 'neon-flicker 5s infinite alternate'}}>
          NEON AGRICORP
        </h1>
        <p className="text-[0.7rem] font-mono text-cyan-400/60 tracking-[0.3em] uppercase">
          {isLogin ? '● AUTHORIZE ●' : '● REGISTER ●'}
        </p>
      </div>

      <div className="glass-panel rounded-xl p-4 w-full max-w-sm mt-[12vh] z-10 max-h-[75vh] overflow-y-auto">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.email')}</label>
            <input type="email" placeholder="operator@neon.corp" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.username')}</label>
              <input type="text" placeholder="NEON_Operator" value={username} onChange={e => setUsername(e.target.value)} required
                className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
            </div>
          )}

          <div className="flex flex-col gap-1">
            <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.password')}</label>
            <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
          </div>

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.confirmPassword')}</label>
              <input type="password" placeholder="••••••••" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                className="w-full px-3 py-2 bg-[#0e0e0f] border border-white/10 rounded text-sm font-mono text-white focus:border-[#00f3ff] focus:outline-none transition-colors" />
            </div>
          )}

          {!isLogin && (
            <div className="flex flex-col gap-1">
              <label className="text-[0.65rem] font-mono text-white/50 uppercase tracking-wider">{t('auth.chooseAvatar')}</label>
              <div className="grid grid-cols-5 gap-1.5 max-h-[140px] overflow-y-auto p-1">
                {Array.from({ length: AVATAR_COUNT }, (_, i) => String(i + 1)).map(id => (
                  <button key={id} type="button" onClick={() => setSelectedAvatar(id)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all cursor-pointer active:scale-95 ${
                      selectedAvatar === id ? 'border-[#00f3ff] shadow-[0_0_8px_rgba(0,243,255,0.4)]' : 'border-white/10 hover:border-white/30'
                    }`}>
                    <img src={`/images/avatars/avatar-${id}.svg`} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}

          <button type="submit" disabled={isSending || !email || !password || (!isLogin && (!username || !confirmPassword))}
            className="w-full py-2 bg-[#00f3ff] text-neutral-950 font-mono text-xs font-bold uppercase rounded transition-all active:scale-95 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
            {isSending ? (
              <span className="flex items-center justify-center gap-2">
                <span className="w-2 h-2 rounded-full bg-neutral-950" style={{animation: 'pulse-dot 1s ease-in-out infinite'}} />
                {t('auth.pleaseWait')}
              </span>
            ) : isLogin ? t('auth.login') : t('auth.register')}
          </button>
        </form>

        <button onClick={() => { setIsLogin(!isLogin); setMessage(''); setConfirmPassword(''); }}
          className="w-full mt-3 text-[0.7rem] font-mono text-cyan-400/60 hover:text-cyan-400 underline underline-offset-4 transition-colors cursor-pointer bg-transparent border-none">
          {isLogin ? t('auth.noAccount') : t('auth.hasAccount')}
        </button>

        {message && (
          <div className={`mt-2 p-2 rounded border text-[0.75rem] font-mono text-center ${
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