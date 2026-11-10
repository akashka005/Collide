import React from 'react';
import { X, Play, Sliders, Shield, Zap, Sparkles } from 'lucide-react';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChatting: () => void;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  onStartChatting,
}) => {
  if (!isOpen) return null;

  const steps = [
    {
      num: '01',
      title: 'Pick Your Mode & Interests',
      desc: 'Choose between real-time video or quick text chat. Add tags like music, coding, or gaming to find peers with similar hobbies.',
      icon: Sliders,
    },
    {
      num: '02',
      title: 'Instant 1-on-1 Matching',
      desc: 'Click start and get matched immediately. No long sign-up forms, no phone numbers, no public profile tracking.',
      icon: Zap,
    },
    {
      num: '03',
      title: 'Collie Has Your Back',
      desc: 'Running out of things to say? Ask Collie for fresh conversation icebreakers, or skip to the next person whenever you want.',
      icon: Sparkles,
    },
    {
      num: '04',
      title: 'Strict Privacy & Zero Trace',
      desc: 'Peer-to-peer WebRTC connections with end-to-end encryption. Once a chat ends, it vanishes completely.',
      icon: Shield,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-hiw-title"
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

        <div className="flex items-center gap-2 mb-2">
          <span className="p-1.5 rounded-full bg-[#6FA8FF]/20 text-[#6FA8FF]">
            <Play className="w-4 h-4 fill-current" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#6FA8FF]">
            Product Walkthrough
          </span>
        </div>

        <h3 id="modal-hiw-title" className="font-serif text-2xl sm:text-3xl font-medium mb-2">
          How Collide Works
        </h3>
        <p className="text-sm text-[#4B4A68] dark:text-slate-300 mb-6">
          Designed for spontaneous, authentic encounters without the baggage of social media profiles.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div 
                key={step.num}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-[#6FA8FF] tracking-wider font-mono">
                      {step.num}
                    </span>
                    <Icon className="w-4 h-4 text-[#4B4A68] dark:text-slate-400" />
                  </div>
                  <h4 className="text-sm font-semibold mb-1 text-[#1B1B3A] dark:text-white">
                    {step.title}
                  </h4>
                  <p className="text-xs leading-relaxed text-[#4B4A68] dark:text-slate-300">
                    {step.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium glass-pill"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onStartChatting();
            }}
            className="px-6 py-2.5 rounded-full text-sm font-medium bg-[#15152B] text-white hover:bg-[#252542] dark:bg-white dark:text-[#15152B]"
          >
            Try It Now
          </button>
        </div>
      </div>
    </div>
  );
};
