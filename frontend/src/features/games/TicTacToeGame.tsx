import React from 'react';
import { RotateCcw, Trophy, Award } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';

export const TicTacToeGame: React.FC = () => {
  const { ticTacToeState, playTicTacToeMove, resetTicTacToe, currentPartner, userProfile } =
    useSocialDiscovery();

  const { board, currentTurn, winner, scores } = ticTacToeState;

  return (
    <div className="p-4 sm:p-5 rounded-2xl glass-surface border border-white/80 dark:border-white/15 mb-4 shadow-lg animate-in fade-in">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <h3 className="text-sm font-semibold text-[#1B1B3A] dark:text-white">
            Live Tic-Tac-Toe
          </h3>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-[#4B4A68] dark:text-slate-300">
          <span>{userProfile.pseudonym} (X): <strong className="text-[#6FA8FF]">{scores.X}</strong></span>
          <span>·</span>
          <span>{currentPartner?.pseudonym || 'Stranger'} (O): <strong className="text-purple-400">{scores.O}</strong></span>
        </div>
      </div>

      {/* Board */}
      <div className="grid grid-cols-3 gap-2 w-48 h-48 mx-auto mb-3">
        {board.map((cell, idx) => (
          <button
            key={idx}
            type="button"
            disabled={cell !== null || winner !== null || currentTurn !== 'X'}
            onClick={() => playTicTacToeMove(idx)}
            className={`w-full h-full rounded-xl flex items-center justify-center text-2xl font-bold transition-all ${cell === 'X'
                ? 'bg-[#6FA8FF]/20 text-[#6FA8FF] border border-[#6FA8FF]/40 shadow-xs'
                : cell === 'O'
                  ? 'bg-purple-500/20 text-purple-400 border border-purple-400/40 shadow-xs'
                  : currentTurn === 'X' && !winner
                    ? 'bg-white/40 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 cursor-pointer border border-white/60'
                    : 'bg-white/20 dark:bg-white/5 opacity-50 cursor-not-allowed border border-white/30'
              }`}
          >
            {cell}
          </button>
        ))}
      </div>
      <div className="flex items-center justify-between text-xs pt-1 border-t border-white/40 dark:border-white/10">
        <div>
          {winner === 'X' ? (
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <Award className="w-3.5 h-3.5" /> You won!
            </span>
          ) : winner === 'O' ? (
            <span className="font-bold text-purple-600 dark:text-purple-300">
              {currentPartner?.pseudonym || 'Partner'} took the round!
            </span>
          ) : winner === 'tie' ? (
            <span className="font-bold text-amber-600 dark:text-amber-400">
              Cat's game! It's a draw!
            </span>
          ) : (
            <span className="text-[#4B4A68] dark:text-slate-300">
              {currentTurn === 'X' ? 'Your move (X)' : `${currentPartner?.pseudonym}'s move (O)...`}
            </span>
          )}
        </div>

        <button
          onClick={resetTicTacToe}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full glass-pill text-[#1B1B3A] dark:text-white hover:bg-white/60"
        >
          <RotateCcw className="w-3 h-3" />
          <span>New Game</span>
        </button>
      </div>
    </div>
  );
};
