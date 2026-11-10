import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { WOULD_YOU_RATHER_BANK } from '../../lib/games';

export const WouldYouRatherGame: React.FC = () => {
  const {
    currentWyrIndex,
    wyrUserChoice,
    wyrPartnerChoice,
    answerWyr,
    nextWyrPrompt,
    currentPartner,
  } = useSocialDiscovery();

  const prompt = WOULD_YOU_RATHER_BANK[currentWyrIndex];
  const hasAnswered = wyrUserChoice !== null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-surface border border-white/80 dark:border-white/15 mb-4 shadow-lg animate-in fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-500">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Would You Rather?</span>
        </div>
        <span className="text-xs text-[#4B4A68] dark:text-slate-400">
          Question {currentWyrIndex + 1} of {WOULD_YOU_RATHER_BANK.length}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <button
          type="button"
          disabled={hasAnswered}
          onClick={() => answerWyr('A')}
          className={`p-3.5 rounded-xl border text-left transition-all relative ${wyrUserChoice === 'A'
              ? 'bg-[#6FA8FF]/25 border-[#6FA8FF] ring-2 ring-[#6FA8FF]/30 font-semibold'
              : 'bg-white/40 dark:bg-white/10 border-white/60 text-[#1B1B3A] dark:text-white'
            } ${!hasAnswered ? 'hover:bg-white/70 cursor-pointer' : ''}`}
        >
          <div className="text-xs font-bold text-[#6FA8FF] uppercase mb-1">Option A</div>
          <p className="text-xs sm:text-sm text-[#1B1B3A] dark:text-white leading-relaxed">
            {prompt.optionA}
          </p>
          {hasAnswered && (
            <div className="mt-2 text-xs font-bold text-[#4B4A68] dark:text-slate-300">
              {prompt.votesA}% of people agree
            </div>
          )}
          {wyrPartnerChoice === 'A' && (
            <span className="absolute top-2 right-2 text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
              {currentPartner?.pseudonym.split(' ')[0]} voted
            </span>
          )}
        </button>
        <button
          type="button"
          disabled={hasAnswered}
          onClick={() => answerWyr('B')}
          className={`p-3.5 rounded-xl border text-left transition-all relative ${wyrUserChoice === 'B'
              ? 'bg-purple-500/25 border-purple-500 ring-2 ring-purple-500/30 font-semibold'
              : 'bg-white/40 dark:bg-white/10 border-white/60 text-[#1B1B3A] dark:text-white'
            } ${!hasAnswered ? 'hover:bg-white/70 cursor-pointer' : ''}`}
        >
          <div className="text-xs font-bold text-purple-400 uppercase mb-1">Option B</div>
          <p className="text-xs sm:text-sm text-[#1B1B3A] dark:text-white leading-relaxed">
            {prompt.optionB}
          </p>
          {hasAnswered && (
            <div className="mt-2 text-xs font-bold text-[#4B4A68] dark:text-slate-300">
              {prompt.votesB}% of people agree
            </div>
          )}
          {wyrPartnerChoice === 'B' && (
            <span className="absolute top-2 right-2 text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
              {currentPartner?.pseudonym.split(' ')[0]} voted
            </span>
          )}
        </button>
      </div>

      {hasAnswered && (
        <div className="flex items-center justify-between pt-2 border-t border-white/40 dark:border-white/10 text-xs">
          <span className="text-[#4B4A68] dark:text-slate-300">
            {wyrUserChoice === wyrPartnerChoice
              ? '✨ You and your partner chose the same option!'
              : 'Diverse minds! You and your partner picked different paths.'}
          </span>
          <button
            onClick={nextWyrPrompt}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] font-medium"
          >
            <span>Next Card</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
