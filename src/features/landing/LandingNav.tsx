import React, { useState } from 'react';
import { Moon, Sun, ArrowUpRight, Menu, X, Sparkles, LogOut, User, ShieldCheck, Mail, LogIn, ChevronDown } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';

interface LandingNavProps {
  isDarkMode: boolean;
  onToggleTheme: () => void;
  onOpenEnter: () => void;
  onOpenHowItWorks: () => void;
  onOpenSafety: () => void;
  onOpenConnections: () => void;
  onOpenModeration: () => void;
  onOpenAuth: (mode: 'login' | 'signup') => void;
  savedConnectionsCount?: number;
  showPricing?: boolean;
}

export const LandingNav: React.FC<LandingNavProps> = ({
  isDarkMode,
  onToggleTheme,
  onOpenEnter,
  onOpenHowItWorks,
  onOpenSafety,
  onOpenConnections,
  onOpenModeration,
  onOpenAuth,
  savedConnectionsCount = 0,
}) => {
  const { authUser, userProfile, logout } = useSocialDiscovery();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'home' | 'discover' | 'features' | 'safety' | 'connections' | 'moderation'>('home');

  const navLinks = [
    { id: 'home' as const, label: 'Home', action: () => { setActiveTab('home'); window.scrollTo({ top: 0, behavior: 'smooth' }); } },
    { id: 'discover' as const, label: 'Lounge', action: () => { setActiveTab('discover'); onOpenEnter(); } },
    { id: 'connections' as const, label: `Connections ${savedConnectionsCount > 0 ? `(${savedConnectionsCount})` : ''}`, action: () => { setActiveTab('connections'); onOpenConnections(); } },
    { id: 'safety' as const, label: 'Safety', action: () => { setActiveTab('safety'); onOpenSafety(); } },
  ];

  return (
    <header className="relative z-30 w-full h-[72px] px-4 sm:px-6 md:px-12 flex items-center justify-between">
      <a
        href="#"
        className="flex items-center gap-2.5 group cursor-pointer focus-visible:rounded-lg"
        aria-label="Collide Home"
      >
        <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-white/40 dark:bg-white/10 backdrop-blur-md border border-white/60 dark:border-white/20 shadow-sm transition-transform duration-300 group-hover:scale-105">
          <Sparkles className="w-4 h-4 text-[#6FA8FF] fill-[#6FA8FF]/30" />
          <div className="absolute inset-0 rounded-full bg-[#6FA8FF]/20 blur-sm -z-10" />
        </div>
        <span className="font-serif text-[28px] md:text-[32px] tracking-tight leading-none text-[#1B1B3A] dark:text-white font-medium select-none">
          Collide
        </span>
      </a>
      <nav
        className="hidden lg:flex items-center gap-1.5 p-1.5 rounded-full glass-surface"
        aria-label="Main Navigation"
      >
        {navLinks.map((link) => {
          const isActive = activeTab === link.id;
          return (
            <button
              key={link.id}
              onClick={link.action}
              className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all duration-200 cursor-pointer ${isActive
                ? 'glass-pill-active text-[#1B1B3A] dark:text-white font-semibold'
                : 'text-[#4B4A68] dark:text-slate-300 hover:text-[#1B1B3A] dark:hover:text-white hover:bg-white/30 dark:hover:bg-white/10'
                }`}
            >
              {link.label}
            </button>
          );
        })}
      </nav>
      <div className="hidden sm:flex items-center gap-2.5">
        <button
          onClick={onToggleTheme}
          aria-label={isDarkMode ? 'Switch to daylight ethereal sky' : 'Switch to twilight night sky'}
          className="flex items-center justify-center w-10 h-10 rounded-full glass-pill cursor-pointer text-[#1B1B3A] dark:text-white"
          title={isDarkMode ? 'Daylight mode' : 'Night mode'}
        >
          {isDarkMode ? (
            <Sun className="w-4 h-4 text-amber-200 transition-transform hover:rotate-45" />
          ) : (
            <Moon className="w-4 h-4 text-[#1B1B3A] transition-transform hover:-rotate-12" />
          )}
        </button>
        {authUser ? (
          <div className="relative">
            <button
              onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-pill cursor-pointer text-[#1B1B3A] dark:text-white border border-white/60 dark:border-white/20"
              aria-label="User account menu"
            >
              <div className="relative w-7 h-7 rounded-full overflow-hidden ring-1 ring-[#6FA8FF]">
                <img src={authUser.avatarUrl} alt={authUser.name} className="w-full h-full object-cover" />
                <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-white" />
              </div>
              <span className="text-xs font-semibold max-w-[100px] truncate">
                {authUser.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            {profileDropdownOpen && (
              <div className="absolute right-0 top-12 w-56 rounded-2xl glass-surface border border-white/80 dark:border-white/20 p-3 shadow-2xl z-50 flex flex-col gap-2 bg-white/95 dark:bg-[#1a1a36]/95 backdrop-blur-xl animate-in fade-in duration-150">
                <div className="px-2 py-1.5 border-b border-black/5 dark:border-white/10">
                  <p className="text-xs font-bold text-[#1B1B3A] dark:text-white truncate">
                    {authUser.name}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {authUser.email || 'Guest Session'}
                  </p>
                  <span className="inline-block mt-1 text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-[#6FA8FF]/15 text-[#3b82f6] dark:text-[#8cbaff]">
                    {authUser.provider === 'google' ? 'Google Account' : authUser.provider === 'email' ? 'Verified Email' : 'Guest Mode'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenEnter();
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <User className="w-3.5 h-3.5 text-[#6FA8FF]" />
                  <span>Discovery Lounge</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenAuth('login');
                  }}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs text-slate-700 dark:text-slate-200 hover:bg-black/5 dark:hover:bg-white/10 transition-colors cursor-pointer text-left"
                >
                  <LogIn className="w-3.5 h-3.5 text-[#6FA8FF]" />
                  <span>Switch Account</span>
                </button>

                <div className="border-t border-black/5 dark:border-white/10 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      logout();
                      setProfileDropdownOpen(false);
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors cursor-pointer text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <button
              onClick={() => onOpenAuth('login')}
              className="px-5 py-2 rounded-full text-[14px] font-medium text-[#1B1B3A] dark:text-white glass-pill cursor-pointer"
            >
              Log In
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="group flex items-center gap-1.5 px-5 py-2 rounded-full text-[14px] font-medium text-white bg-[#15152B] dark:bg-white dark:text-[#15152B] shadow-md hover:bg-[#252542] dark:hover:bg-slate-100 hover:-translate-y-0.5 transition-all duration-200 cursor-pointer"
            >
              <span>Get Started</span>
              <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </>
        )}
      </div>
      <div className="flex sm:hidden items-center gap-2">
        <button
          onClick={onToggleTheme}
          aria-label="Toggle theme"
          className="flex items-center justify-center w-9 h-9 rounded-full glass-pill text-[#1B1B3A] dark:text-white"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-200" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle navigation menu"
          aria-expanded={mobileMenuOpen}
          className="flex items-center justify-center w-9 h-9 rounded-full glass-pill text-[#1B1B3A] dark:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-4 right-4 p-5 rounded-2xl glass-surface border border-white/70 dark:border-white/20 shadow-2xl z-50 flex flex-col gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  link.action();
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === link.id
                  ? 'bg-white/60 dark:bg-white/20 text-[#1B1B3A] dark:text-white font-semibold'
                  : 'text-[#4B4A68] dark:text-slate-300 hover:bg-white/30'
                  }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="pt-3 border-t border-black/5 dark:border-white/10 flex flex-col gap-2">
            {authUser ? (
              <div className="flex items-center justify-between p-2 rounded-xl bg-black/5 dark:bg-white/5">
                <div className="flex items-center gap-2">
                  <img src={authUser.avatarUrl} alt={authUser.name} className="w-8 h-8 rounded-full object-cover" />
                  <div>
                    <p className="text-xs font-semibold text-[#1B1B3A] dark:text-white">{authUser.name}</p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">{authUser.email || 'Guest'}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg text-xs font-semibold"
                >
                  Log Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl text-xs font-semibold glass-pill text-center text-[#1B1B3A] dark:text-white"
                >
                  Log In
                </button>
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="py-2.5 rounded-xl text-xs font-semibold bg-[#15152B] dark:bg-white text-white dark:text-[#15152B] text-center shadow-md"
                >
                  Sign Up
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
