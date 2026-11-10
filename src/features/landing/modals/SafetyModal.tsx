import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, UserX } from 'lucide-react';

interface SafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SafetyModal: React.FC<SafetyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const commitments = [
    {
      icon: EyeOff,
      title: 'Zero Private Chat Inspection',
      desc: 'Collie does not read or analyze your private conversations. Icebreakers are opt-in client suggestions to jumpstart talking.',
    },
    {
      icon: Lock,
      title: 'Peer-to-Peer Encrypted',
      desc: 'Video and audio connections run over direct WebRTC streams. No video data is recorded, saved, or indexed on our servers.',
    },
    {
      icon: UserX,
      title: 'Instant Skip & User Blocking',
      desc: 'You are always in total control. Skip any conversation immediately with a single tap, or block disrespectful participants forever.',
    },
    {
      icon: ShieldCheck,
      title: '18+ Adult Community Standards',
      desc: 'Strict community guidelines against non-consensual behavior, hate speech, and harassment with immediate enforcement.',
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-safety-title"
    >
      <div 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative w-full max-w-2xl p-5 sm:p-7 rounded-3xl glass-surface border border-white/80 dark:border-white/20 shadow-2xl bg-white/95 dark:bg-[#15152B]/95 text-[#1B1B3A] dark:text-white max-h-[90vh] overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1.5">
          <span className="p-1.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Safety & Privacy First
          </span>
        </div>

        <h3 id="modal-safety-title" className="font-serif text-2xl sm:text-3xl font-medium mb-1.5">
          Your Safety on Collide
        </h3>
        <p className="text-xs sm:text-sm text-[#4B4A68] dark:text-slate-300 mb-5">
          We designed Collide from the ground up so you can explore random encounters safely, anonymously, and with full privacy.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {commitments.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.title}
                className="p-3 sm:p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex items-start gap-3"
              >
                <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs text-[#6FA8FF] shrink-0">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-[#1B1B3A] dark:text-white mb-0.5">
                    {c.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs leading-relaxed text-[#4B4A68] dark:text-slate-300">
                    {c.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 rounded-full text-xs sm:text-sm font-medium bg-[#15152B] text-white hover:bg-[#252542] dark:bg-white dark:text-[#15152B] cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
