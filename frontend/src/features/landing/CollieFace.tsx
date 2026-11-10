import React from 'react';
import { PupilOffset, CollieMood } from '../../lib/squish_physics';

interface CollieFaceProps {
  pupilOffset: PupilOffset;
  mood: CollieMood;
  isBlinking: boolean;
  isPressed: boolean;
  isHovered: boolean;
}

export const CollieFace: React.FC<CollieFaceProps> = ({
  pupilOffset,
  mood,
  isBlinking,
  isPressed,
  isHovered,
}) => {
  const effectiveMood: CollieMood = isPressed
    ? 'squished'
    : mood !== 'tracking'
      ? mood
      : isHovered
        ? 'happy'
        : 'tracking';

  const eyeTransform = effectiveMood === 'tracking' && !isBlinking
    ? `translate3d(${pupilOffset.x}px, ${pupilOffset.y}px, 0)`
    : 'translate3d(0, 0, 0)';

  const showBlush = isPressed || isHovered || effectiveMood === 'happy' || effectiveMood === 'hearts' || effectiveMood === 'squished';

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none z-10 flex items-center justify-center"
      aria-hidden="true"
    >
      <div
        className="absolute top-[37.4%] left-[25.2%] w-[42.2%] h-[29.4%] rounded-[46%_48%_44%_42%] overflow-hidden flex flex-col items-center justify-between p-2 sm:p-2.5 transition-colors duration-300"
        style={{
          transform: 'rotate(-4.5deg)',
          transformOrigin: '50% 50%',
          background: 'radial-gradient(ellipse at 42% 35%, #2a3550 0%, #151c2e 65%, #0c101c 100%)',
          boxShadow: 'inset 0 2px 6px rgba(255,255,255,0.22), inset 0 -4px 10px rgba(0,0,0,0.8), 0 0 14px rgba(111,168,255,0.3)',
          border: '1px solid rgba(130, 180, 255, 0.32)',
        }}
      >
        <div
          className="absolute top-1 left-2.5 right-6 h-5 rounded-full bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none rotate-[-4deg]"
        />
        <div
          className="relative w-full flex-1 flex items-center justify-around px-2 pt-1 transition-transform duration-100 ease-out"
          style={{ transform: eyeTransform }}
        >
          <div
            className="relative flex items-center justify-center transition-all duration-150"
            style={{
              transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
              transformOrigin: 'center',
            }}
          >
            {effectiveMood === 'tracking' && (
              <div className="relative w-7 h-6 sm:w-8 sm:h-7 rounded-full bg-gradient-to-b from-[#8ce9ff] to-[#3aa2ff] flex items-center justify-center shadow-[0_0_12px_rgba(75,190,255,0.9)]">
                <div
                  className="w-4 h-4 rounded-full bg-[#0d2138] flex items-center justify-center transition-transform duration-75"
                  style={{ transform: `translate(${pupilOffset.x * 0.3}px, ${pupilOffset.y * 0.3}px)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#5be4ff]" />
                </div>
                <div className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                <div className="absolute bottom-1 right-2 w-1 h-1 rounded-full bg-white/90" />
              </div>
            )}
            {effectiveMood === 'happy' && (
              <svg className="w-8 h-6 text-[#5de6ff] drop-shadow-[0_0_8px_rgba(93,230,255,0.95)]" viewBox="0 0 32 24" fill="none">
                <path d="M4 18 C10 6, 22 6, 28 18" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            )}
            {effectiveMood === 'squished' && (
              <svg className="w-8 h-6 text-[#75ecff] drop-shadow-[0_0_10px_rgba(117,236,255,1)]" viewBox="0 0 32 24" fill="none">
                <path d="M6 6 L22 13 L6 20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {effectiveMood === 'hearts' && (
              <div className="text-pink-400 drop-shadow-[0_0_10px_rgba(255,105,180,0.95)] animate-pulse">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            )}
            {effectiveMood === 'stars' && (
              <div className="text-amber-300 drop-shadow-[0_0_10px_rgba(255,220,100,0.95)] animate-spin" style={{ animationDuration: '8s' }}>
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                  <polygon points="12,1.5 15.2,8.8 23,9.5 17.2,14.8 18.8,22.5 12,18.5 5.2,22.5 6.8,14.8 1,9.5 8.8,8.8" />
                </svg>
              </div>
            )}
            {effectiveMood === 'wink' && (
              <svg className="w-8 h-6 text-[#5de6ff] drop-shadow-[0_0_8px_rgba(93,230,255,0.95)]" viewBox="0 0 32 24" fill="none">
                <path d="M4 16 C10 8, 22 8, 28 16" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            )}
            {effectiveMood === 'sleepy' && (
              <svg className="w-8 h-6 text-[#69caff] opacity-80" viewBox="0 0 32 24" fill="none">
                <path d="M5 14 Q16 19 27 14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div
            className="relative flex items-center justify-center transition-all duration-150"
            style={{
              transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
              transformOrigin: 'center',
            }}
          >
            {effectiveMood === 'tracking' && (
              <div className="relative w-7 h-6 sm:w-8 sm:h-7 rounded-full bg-gradient-to-b from-[#8ce9ff] to-[#3aa2ff] flex items-center justify-center shadow-[0_0_12px_rgba(75,190,255,0.9)]">
                <div
                  className="w-4 h-4 rounded-full bg-[#0d2138] flex items-center justify-center transition-transform duration-75"
                  style={{ transform: `translate(${pupilOffset.x * 0.3}px, ${pupilOffset.y * 0.3}px)` }}
                >
                  <div className="w-2 h-2 rounded-full bg-[#5be4ff]" />
                </div>
                <div className="absolute top-1 left-1.5 w-2.5 h-2.5 rounded-full bg-white shadow-xs" />
                <div className="absolute bottom-1 right-2 w-1 h-1 rounded-full bg-white/90" />
              </div>
            )}
            {effectiveMood === 'happy' && (
              <svg className="w-8 h-6 text-[#5de6ff] drop-shadow-[0_0_8px_rgba(93,230,255,0.95)]" viewBox="0 0 32 24" fill="none">
                <path d="M4 18 C10 6, 22 6, 28 18" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            )}
            {effectiveMood === 'squished' && (
              <svg className="w-8 h-6 text-[#75ecff] drop-shadow-[0_0_10px_rgba(117,236,255,1)]" viewBox="0 0 32 24" fill="none">
                <path d="M26 6 L10 13 L26 20" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {effectiveMood === 'hearts' && (
              <div className="text-pink-400 drop-shadow-[0_0_10px_rgba(255,105,180,0.95)] animate-pulse">
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </div>
            )}
            {effectiveMood === 'stars' && (
              <div className="text-amber-300 drop-shadow-[0_0_10px_rgba(255,220,100,0.95)] animate-spin" style={{ animationDuration: '8s' }}>
                <svg className="w-7 h-7 sm:w-8 sm:h-8 fill-current" viewBox="0 0 24 24">
                  <polygon points="12,1.5 15.2,8.8 23,9.5 17.2,14.8 18.8,22.5 12,18.5 5.2,22.5 6.8,14.8 1,9.5 8.8,8.8" />
                </svg>
              </div>
            )}
            {effectiveMood === 'wink' && (
              <div className="relative w-7 h-6 sm:w-8 sm:h-7 rounded-full bg-gradient-to-b from-[#8ce9ff] to-[#3aa2ff] flex items-center justify-center shadow-[0_0_12px_rgba(75,190,255,0.9)]">
                <div className="w-3.5 h-3.5 rounded-full bg-[#0d2138] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#5be4ff]" />
                </div>
                <div className="absolute top-1 left-1.5 w-2 h-2 rounded-full bg-white" />
              </div>
            )}
            {effectiveMood === 'sleepy' && (
              <svg className="w-8 h-6 text-[#69caff] opacity-80" viewBox="0 0 32 24" fill="none">
                <path d="M5 14 Q16 19 27 14" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            )}
          </div>
        </div>
        <div className="relative w-full flex items-center justify-center pb-1">
          <div
            className={`absolute left-3 w-4 h-2 rounded-full bg-pink-400/80 blur-[2px] transition-opacity duration-300 ${showBlush ? 'opacity-90 scale-110' : 'opacity-0 scale-75'
              }`}
          />
          <div className="flex items-center justify-center">
            {effectiveMood === 'squished' ? (
              <div className="w-3.5 h-3 rounded-full bg-[#6fe7ff] shadow-[0_0_8px_rgba(111,231,255,0.9)] flex items-center justify-center">
                <div className="w-2 h-1.5 rounded-full bg-[#1b436b]" />
              </div>
            ) : effectiveMood === 'sleepy' ? (
              <div className="w-1.5 h-1 rounded-full bg-[#6fe7ff]/60" />
            ) : (
              <svg className="w-6 h-3 text-[#6fe7ff] drop-shadow-[0_0_6px_rgba(111,231,255,0.85)]" viewBox="0 0 24 12" fill="none">
                <path d="M5 3 C6 8, 11 8, 12 4 C13 8, 18 8, 19 3" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" />
              </svg>
            )}
          </div>
          <div
            className={`absolute right-3 w-4 h-2 rounded-full bg-pink-400/80 blur-[2px] transition-opacity duration-300 ${showBlush ? 'opacity-90 scale-110' : 'opacity-0 scale-75'
              }`}
          />
        </div>
      </div>
    </div>
  );
};
