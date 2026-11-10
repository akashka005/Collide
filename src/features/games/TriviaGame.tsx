import React from 'react';
import { HelpCircle, ArrowRight, Award } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { TRIVIA_BANK } from '../../lib/games';

export const TriviaGame: React.FC = () => {
  const {
    currentTriviaIndex,
    triviaUserAnswer,
    triviaPartnerAnswer,
    triviaScores,
    answerTrivia,
    nextTriviaQuestion,
    currentPartner,
  } = useSocialDiscovery();

  const question = TRIVIA_BANK[currentTriviaIndex];
  const hasAnswered = triviaUserAnswer !== null;

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-surface border border-white/80 dark:border-white/15 mb-4 shadow-lg animate-in fade-in">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-[#6FA8FF]">
          <HelpCircle className="w-3.5 h-3.5" />
          <span>{question.category}</span>
        </div>
        <div className="flex items-center gap-3 text-xs font-medium text-[#4B4A68] dark:text-slate-300">
          <span>You: <strong className="text-[#6FA8FF]">{triviaScores.user} pts</strong></span>
          <span>·</span>
          <span>{currentPartner?.pseudonym || 'Partner'}: <strong className="text-purple-400">{triviaScores.partner} pts</strong></span>
        </div>
      </div>

      <h4 className="font-semibold text-sm sm:text-base text-[#1B1B3A] dark:text-white mb-3">
        {question.question}
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
        {question.options.map((opt, idx) => {
          const isSelected = triviaUserAnswer === idx;
          const isCorrect = idx === question.correctAnswer;
          const partnerSelected = triviaPartnerAnswer === idx;

          let btnClass = 'bg-white/40 dark:bg-white/10 text-[#1B1B3A] dark:text-white border-white/60';
          if (hasAnswered) {
            if (isCorrect) {
              btnClass = 'bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold';
            } else if (isSelected) {
              btnClass = 'bg-rose-500/20 border-rose-500 text-rose-700 dark:text-rose-300 line-through';
            }
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={hasAnswered}
              onClick={() => answerTrivia(idx)}
              className={`p-2.5 rounded-xl text-xs sm:text-sm text-left border transition-all relative ${btnClass} ${!hasAnswered ? 'hover:bg-white/70 dark:hover:bg-white/20 cursor-pointer' : ''
                }`}
            >
              <div className="flex items-center justify-between">
                <span>{opt}</span>
                <div className="flex items-center gap-1">
                  {isSelected && <span className="text-[10px] bg-[#6FA8FF] text-white px-1.5 py-0.5 rounded-full">You</span>}
                  {partnerSelected && hasAnswered && (
                    <span className="text-[10px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full">
                      {currentPartner?.pseudonym.split(' ')[0]}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {hasAnswered && (
        <div className="flex items-center justify-between pt-2 border-t border-white/40 dark:border-white/10 text-xs">
          <span className="text-[#4B4A68] dark:text-slate-300">
            {triviaUserAnswer === question.correctAnswer
              ? '🎉 Correct! +100 points'
              : `Incorrect! Correct answer: ${question.options[question.correctAnswer]}`}
          </span>
          <button
            onClick={nextTriviaQuestion}
            className="flex items-center gap-1 px-3 py-1 rounded-full bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] font-medium"
          >
            <span>Next Question</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
