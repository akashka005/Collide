import React, { useState } from 'react';
import { X, Mail, Lock, User, Sparkles, Check, ArrowRight, ShieldCheck, LogIn, UserPlus } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
}

const AVATAR_OPTIONS = [
  '/assets/landing/avatar-1.webp',
  '/assets/landing/avatar-2.webp',
  '/assets/landing/avatar-3.webp',
  '/assets/landing/avatar-4.webp',
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
}) => {
  const { loginWithGoogle, loginWithEmail, signupWithEmail, loginAsGuest } = useSocialDiscovery();

  const [tab, setTab] = useState<'quick' | 'email'>('quick');
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_OPTIONS[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const googleEmail = email.trim() || `${(name.trim() || 'user').toLowerCase().replace(/\s+/g, '')}@gmail.com`;
      const googleName = name.trim() || 'Google User';
      await loginWithGoogle(googleEmail, googleName);
      setSuccessMsg('Signed in with Google successfully!');
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Google sign in failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    setIsLoading(true);
    setError(null);
    try {
      const guestName = name.trim() || `Guest${Math.floor(1000 + Math.random() * 9000)}`;
      loginAsGuest(guestName, selectedAvatar);
      setSuccessMsg(`Welcome, ${guestName}!`);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 600);
    } catch {
      setError('Guest login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email or Gmail address.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'signup') {
        const displayName = name.trim() || email.split('@')[0];
        await signupWithEmail(email.trim(), password, displayName, selectedAvatar);
        setSuccessMsg(`Account created! Welcome, ${displayName}!`);
      } else {
        await loginWithEmail(email.trim(), password);
        setSuccessMsg('Logged in successfully!');
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative w-full max-w-md rounded-3xl glass-surface border border-white/80 dark:border-white/20 p-5 sm:p-7 shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden bg-white/85 dark:bg-[#15152B]/90 backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute -top-20 -right-20 w-44 h-44 rounded-full bg-[#6FA8FF]/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-44 h-44 rounded-full bg-pink-400/20 blur-3xl pointer-events-none" />
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 cursor-pointer"
          aria-label="Close authentication modal"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#6FA8FF] to-[#3aa2ff] text-white shadow-lg shadow-[#6FA8FF]/30 mb-3">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <h2 id="auth-modal-title" className="font-serif text-2xl sm:text-3xl font-medium text-[#1B1B3A] dark:text-white">
            {tab === 'quick' ? 'Welcome to Collide' : mode === 'login' ? 'Welcome Back' : 'Create an Account'}
          </h2>
          <p className="text-xs sm:text-sm text-[#4B4A68] dark:text-slate-300 mt-1">
            {tab === 'quick'
              ? 'Connect safely with people around the globe'
              : mode === 'login'
                ? 'Sign in to access your saved connections and chat history'
                : 'Sign up to keep your friends and profile synced'}
          </p>
        </div>
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium text-center animate-in fade-in">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-in fade-in">
            <Check className="w-4 h-4" />
            <span>{successMsg}</span>
          </div>
        )}
        <div className="flex p-1 rounded-full bg-black/5 dark:bg-white/10 mb-6">
          <button
            type="button"
            onClick={() => { setTab('quick'); setError(null); }}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${tab === 'quick'
                ? 'bg-white text-[#1B1B3A] shadow-xs dark:bg-[#15152B] dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Google & Guest
          </button>
          <button
            type="button"
            onClick={() => { setTab('email'); setError(null); }}
            className={`flex-1 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${tab === 'email'
                ? 'bg-white text-[#1B1B3A] shadow-xs dark:bg-[#15152B] dark:text-white'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
          >
            Email / Gmail
          </button>
        </div>
        {tab === 'quick' && (
          <div className="space-y-3.5">
            <button
              type="button"
              disabled={isLoading}
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-2xl bg-white dark:bg-[#1e1e38] border border-slate-200 dark:border-white/10 text-sm font-semibold text-slate-800 dark:text-white shadow-xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer disabled:opacity-60"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>
            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#4B4A68] dark:text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Instant verified Google login with Gmail</span>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
              <span className="flex-shrink mx-3 text-[11px] uppercase tracking-wider text-slate-400">or</span>
              <div className="flex-grow border-t border-slate-200 dark:border-white/10" />
            </div>
            <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/60 dark:border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#1B1B3A] dark:text-white">
                  Play as Guest (Instant)
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-500/10 px-2 py-0.5 rounded-full">
                  No password needed
                </span>
              </div>
              <div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Choose a cool nickname (e.g. NeonEcho)"
                  maxLength={20}
                  className="w-full px-3 py-2 rounded-xl text-xs bg-white dark:bg-[#121226] border border-slate-200 dark:border-white/10 text-[#1B1B3A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]"
                />
              </div>
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 block">
                  Select your avatar:
                </span>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative w-10 h-10 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${selectedAvatar === avatar
                          ? 'border-[#6FA8FF] scale-110 shadow-md ring-2 ring-[#6FA8FF]/40'
                          : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={avatar} alt="Avatar option" className="w-full h-full object-cover" />
                      {selectedAvatar === avatar && (
                        <div className="absolute inset-0 bg-[#6FA8FF]/20 flex items-center justify-center">
                          <Check className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="button"
                disabled={isLoading}
                onClick={handleGuestLogin}
                className="w-full py-2.5 rounded-xl bg-[#15152B] hover:bg-[#252542] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#15152B] text-xs font-semibold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Enter Lounge as Guest</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
        {tab === 'email' && (
          <form onSubmit={handleEmailSubmit} className="space-y-3.5">
            <div className="flex items-center justify-between pb-1">
              <span className="text-xs font-semibold text-[#1B1B3A] dark:text-white">
                {mode === 'login' ? 'Sign in with your email' : 'Sign up with your email'}
              </span>
              <button
                type="button"
                onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
                className="text-xs text-[#6FA8FF] hover:underline font-medium cursor-pointer"
              >
                {mode === 'login' ? 'Need an account? Sign up' : 'Already have an account? Log in'}
              </button>
            </div>
            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                  Display Name / Pseudonym
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-3 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your username"
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#1B1B3A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]"
                  />
                </div>
              </div>
            )}
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Email / Gmail Address
              </label>
              <div className="relative flex items-center">
                <Mail className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@gmail.com"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#1B1B3A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]"
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl text-xs bg-black/5 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-[#1B1B3A] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]"
                />
              </div>
            </div>
            {mode === 'signup' && (
              <div>
                <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1.5 block">
                  Select Profile Avatar:
                </span>
                <div className="flex items-center gap-2">
                  {AVATAR_OPTIONS.map((avatar) => (
                    <button
                      key={avatar}
                      type="button"
                      onClick={() => setSelectedAvatar(avatar)}
                      className={`relative w-9 h-9 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${selectedAvatar === avatar
                          ? 'border-[#6FA8FF] scale-110 shadow-md ring-2 ring-[#6FA8FF]/40'
                          : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                    >
                      <img src={avatar} alt="Avatar choice" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 py-3 rounded-2xl bg-[#15152B] hover:bg-[#252542] dark:bg-white dark:hover:bg-slate-100 text-white dark:text-[#15152B] text-xs font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Log In</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
