import React, { useState } from 'react';
import { ShieldCheck, Calendar, AlertCircle } from 'lucide-react';

interface AgeGateProps {
  onVerified: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 100 }, (_, i) => currentYear - 13 - i);

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

export function AgeGate({ onVerified }: AgeGateProps) {
  const [day, setDay] = useState('');
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [shake, setShake] = useState(false);

  const daysInMonth = month && year ? getDaysInMonth(Number(month), Number(year)) : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  const handleVerify = () => {
    setError('');

    if (!day || !month || !year) {
      setError('Please select your full date of birth.');
      triggerShake();
      return;
    }

    if (!agreed) {
      setError('You must agree to the Community Guidelines to continue.');
      triggerShake();
      return;
    }

    const dob = new Date(Number(year), Number(month) - 1, Number(day));
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const mDiff = today.getMonth() - dob.getMonth();
    if (mDiff < 0 || (mDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      setError('You must be 18 or older to access Collide.');
      triggerShake();
      return;
    }

    localStorage.setItem('collide_age_verified', 'true');
    onVerified();
  };

  const selectClass =
    'flex-1 min-w-0 bg-white/10 border border-white/20 text-white rounded-xl px-3 py-2.5 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-400/60 focus:border-indigo-400/60 cursor-pointer transition-all backdrop-blur-sm';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" />
      <div
        className={`relative z-10 w-full max-w-md rounded-3xl overflow-hidden transition-transform ${shake ? 'animate-[shake_0.5s_ease-in-out]' : ''}`}
        style={{
          background: 'linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)',
          border: '1px solid rgba(255,255,255,0.18)',
          boxShadow: '0 32px 64px -12px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
        }}
      >
        <div className="h-1 w-full bg-gradient-to-r from-indigo-500 via-violet-500 to-purple-500" />

        <div className="px-7 py-8">
          <div className="flex flex-col items-center text-center mb-7">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3))', border: '1px solid rgba(99,102,241,0.4)' }}>
              <ShieldCheck className="w-7 h-7 text-indigo-300" strokeWidth={1.5} />
            </div>
            <div className="text-xs font-semibold tracking-[0.18em] text-indigo-300/80 uppercase mb-2">Age Verification</div>
            <h1 className="font-serif text-2xl font-semibold text-white leading-snug mb-2">
              You must be 18+ to enter
            </h1>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs">
              Collide is an adults-only platform. Please verify your date of birth to continue.
            </p>
          </div>

          <div className="mb-5">
            <div className="flex items-center gap-1.5 mb-2">
              <Calendar className="w-3.5 h-3.5 text-indigo-300/70" strokeWidth={1.5} />
              <span className="text-xs font-medium text-white/60 tracking-wide uppercase">Date of Birth</span>
            </div>
            <div className="flex gap-2">
              <div className="relative flex-1 min-w-0">
                <select
                  value={day}
                  onChange={e => setDay(e.target.value)}
                  className={selectClass}
                  aria-label="Day"
                >
                  <option value="" className="bg-gray-800">Day</option>
                  {days.map(d => (
                    <option key={d} value={d} className="bg-gray-800">{d}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-[1.5] min-w-0">
                <select
                  value={month}
                  onChange={e => { setMonth(e.target.value); setDay(''); }}
                  className={selectClass}
                  aria-label="Month"
                >
                  <option value="" className="bg-gray-800">Month</option>
                  {MONTHS.map((m, i) => (
                    <option key={m} value={i + 1} className="bg-gray-800">{m}</option>
                  ))}
                </select>
              </div>
              <div className="relative flex-[1.2] min-w-0">
                <select
                  value={year}
                  onChange={e => setYear(e.target.value)}
                  className={selectClass}
                  aria-label="Year"
                >
                  <option value="" className="bg-gray-800">Year</option>
                  {YEARS.map(y => (
                    <option key={y} value={y} className="bg-gray-800">{y}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
          <label className="flex items-start gap-3 cursor-pointer mb-6 group select-none">
            <div className="relative mt-0.5 flex-shrink-0">
              <input
                type="checkbox"
                checked={agreed}
                onChange={e => setAgreed(e.target.checked)}
                className="sr-only"
              />
              <div
                className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${agreed
                    ? 'bg-indigo-500 border-indigo-400'
                    : 'bg-white/10 border-white/25 group-hover:border-white/40'
                  }`}
              >
                {agreed && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2 6l3 3 5-5" />
                  </svg>
                )}
              </div>
            </div>
            <span className="text-xs text-white/55 leading-relaxed group-hover:text-white/70 transition-colors">
              I confirm I am 18 years of age or older and agree to the{' '}
              <span className="text-indigo-300/90 underline underline-offset-2 cursor-pointer">
                Community Guidelines
              </span>{' '}
              and{' '}
              <span className="text-indigo-300/90 underline underline-offset-2 cursor-pointer">
                Terms of Service
              </span>
              .
            </span>
          </label>
          {error && (
            <div className="flex items-center gap-2 mb-4 px-3.5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/25">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" strokeWidth={1.5} />
              <span className="text-xs text-red-300">{error}</span>
            </div>
          )}
          <button
            onClick={handleVerify}
            className="w-full py-3 rounded-2xl font-semibold text-sm text-white transition-all duration-200 active:scale-[0.98] hover:opacity-90"
            style={{
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
              boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
            }}
          >
            Verify Age & Enter
          </button>
          <p className="text-center text-[11px] text-white/30 mt-4 leading-relaxed">
            Your date of birth is used only for age verification and is not stored on our servers.
          </p>
        </div>
      </div>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15% { transform: translateX(-6px); }
          30% { transform: translateX(6px); }
          45% { transform: translateX(-5px); }
          60% { transform: translateX(5px); }
          75% { transform: translateX(-3px); }
          90% { transform: translateX(3px); }
        }
      `}</style>
    </div>
  );
}