import React, { useState } from 'react';
import { supabase } from './supabaseClient';

const AuthScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email: email,
      options: {
        shouldCreateUser: true, // Allows new users to sign up via OTP
      },
    });

    if (error) {
      setMessage(\`Error: \${error.message}\`);
    } else {
      setMessage(\`Magic link sent to \${email}. Check your email (and spam folder) for the code.\`);
      setEmail('');
    }
    setIsSending(false);
  };

  return (
    <div style={{ padding: '20px', border: '2px solid #ff00ff', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h2 style={{ color: '#ff00ff', textShadow: '0 0 5px #ff00ff' }}>Secure Access Required</h2>
      <p>Enter your email to log in or sign up with a magic link.</p>
      
      <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input
          type="email"
          placeholder="Your Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', backgroundColor: '#111', color: '#00ffff', border: '1px solid #00ffff' }}
        />
        <button type="submit" disabled={isSending || !email}>
          {isSending ? 'Sending Link...' : 'Send Magic Link'}
        </button>
      </form>
      
      {message && <p style={{ marginTop: '15px', fontSize: '0.9em' }}>{message}</p>}
      
      <p style={{ fontSize: '0.75em', marginTop: '20px', color: '#aaaaaa' }}>
        Note: After receiving the code, you will need to input it to finalize authentication. This initial step only generates the code.
      </p>
    </div>
  );
};

export default AuthScreen;
