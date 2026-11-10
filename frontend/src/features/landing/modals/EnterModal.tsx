import React, { useState } from 'react';
import { X, Video, MessageCircle, Sparkles, Check, ArrowRight, ShieldCheck } from 'lucide-react';

interface EnterModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'video' | 'text';
}

const INTEREST_TAGS = [
  'Anime & Manga',
  'Gaming',
  'Music Production',
  'Tech & AI',
  'Travel Stories',
  'Philosophy',
  'Creative Writing',
  'Late Night Chill',
];

export const EnterModal: React.FC<EnterModalProps> = ({
  isOpen,
  onClose,
  defaultMode = 'video',
}) => {
  const [mode, setMode] = useState<'video' | 'text'>(defaultMode);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Gaming', 'Late Night Chill']);
  const [isAgeConfirmed, setIsAgeConfirmed] = useState(true);
  const [isMatching, setIsMatching] = useState(false);
  const [matchedUser, setMatchedUser] = useState<string | null>(null);

  if (!isOpen) return null;

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleStartMatch = () => {
    if (!isAgeConfirmed) return;
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchedUser('Alex from Kyoto');
    }, 2000);
  };

  const handleReset = () => {
    setMatchedUser(null);
    setIsMatching(false);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-enter-title"
    >
      <div
        className="relative w-full max-w-lg p-6 sm:p-8 rounded-3xl glass-surface border border-white/80 dark:border-white/20 shadow-2xl bg-white/90 dark:bg-[#15152B]/95 text-[#1B1B3A] dark:text-white max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-5 right-5 p-2 rounded-full glass-pill hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {!matchedUser && !isMatching ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1.5 rounded-full bg-[#6FA8FF]/20 text-[#6FA8FF]">
                <Sparkles className="w-4 h-4" />
              </span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#6FA8FF]">
                Instant Connection
              </span>
            </div>

            <h3 id="modal-enter-title" className="font-serif text-2xl sm:text-3xl font-medium mb-2">
              Enter the Collide Lounge
            </h3>
            <p className="text-sm text-[#4B4A68] dark:text-slate-300 mb-6">
              Choose your chat mode and common interests. You will be instantly connected with a random stranger.
            </p>
            <div className="mb-5">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4B4A68] dark:text-slate-400 mb-2">
                Chat Mode
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setMode('video')}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border text-sm font-medium transition-all ${mode === 'video'
                      ? 'border-[#15152B] dark:border-white bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                >
                  <Video className="w-4 h-4" />
                  <span>Video & Audio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMode('text')}
                  className={`flex items-center justify-center gap-2.5 p-3 rounded-2xl border text-sm font-medium transition-all ${mode === 'text'
                      ? 'border-[#15152B] dark:border-white bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-md'
                      : 'border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800'
                    }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Text Only</span>
                </button>
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#4B4A68] dark:text-slate-400 mb-2">
                Match by Interests (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {INTEREST_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${isSelected
                          ? 'bg-[#6FA8FF] text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-[#4B4A68] dark:text-slate-300 hover:bg-slate-200'
                        }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>
            <label className="flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={isAgeConfirmed}
                onChange={(e) => setIsAgeConfirmed(e.target.checked)}
                className="mt-0.5 rounded text-[#15152B] focus:ring-offset-0"
              />
              <span className="text-xs text-[#4B4A68] dark:text-slate-300">
                I confirm that I am at least <strong>18 years of age</strong> and agree to follow Collide's respectful community guidelines.
              </span>
            </label>
            <button
              type="button"
              disabled={!isAgeConfirmed}
              onClick={handleStartMatch}
              className={`w-full py-3.5 px-6 rounded-full text-sm font-medium flex items-center justify-center gap-2 transition-all shadow-md ${isAgeConfirmed
                  ? 'bg-[#15152B] text-white hover:bg-[#252542] dark:bg-white dark:text-[#15152B] dark:hover:bg-slate-100 cursor-pointer'
                  : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-800 dark:text-slate-600'
                }`}
            >
              <span>Connect Instantly</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : isMatching ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative w-20 h-20 mb-6">
              <div className="absolute inset-0 rounded-full border-4 border-[#6FA8FF]/30 animate-ping" />
              <div className="relative w-full h-full rounded-full border-4 border-t-[#6FA8FF] border-slate-200 dark:border-slate-700 animate-spin flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-[#6FA8FF]" />
              </div>
            </div>
            <h4 className="font-serif text-2xl font-medium mb-2">
              Finding a friendly stranger...
            </h4>
            <p className="text-sm text-[#4B4A68] dark:text-slate-400 max-w-xs">
              Filtering for peers interested in {selectedTags.slice(0, 2).join(' & ')}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-500 flex items-center justify-center mb-4">
              <Check className="w-8 h-8" />
            </div>
            <h4 className="font-serif text-2xl font-medium mb-1">
              Connected with {matchedUser}!
            </h4>
            <p className="text-sm text-[#4B4A68] dark:text-slate-300 mb-6 max-w-xs">
              Your {mode === 'video' ? 'video' : 'text'} stream is encrypted end-to-end. Collie is ready with icebreakers if you get stuck.
            </p>
            <div className="flex gap-3 w-full">
              <button
                onClick={handleReset}
                className="flex-1 py-3 rounded-full text-sm font-medium glass-pill"
              >
                Next Match
              </button>
              <button
                onClick={onClose}
                className="flex-1 py-3 rounded-full text-sm font-medium bg-[#15152B] text-white dark:bg-white dark:text-[#15152B]"
              >
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
