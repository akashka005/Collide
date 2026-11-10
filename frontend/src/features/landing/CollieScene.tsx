import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, RefreshCw, Volume2, VolumeX, Heart, Wand2 } from 'lucide-react';
import { CollieFace } from './CollieFace';
import {
  calculatePupilOffset,
  calculateSquashStretch,
  getColliePetReaction,
  PupilOffset,
  CollieMood
} from '../../lib/squish_physics';
import { collieAudio } from '../../lib/squish_audio';

interface CollieSceneProps {
  onAskIcebreaker?: () => void;
}

interface FloatingParticle {
  id: number;
  x: number;
  y: number;
  char: string;
  color: string;
}

const ICEBREAKERS = [
  "Ask me for an icebreaker and I'll help you start the conversation. ♡",
  "“What's the best concert or festival you've ever experienced?”",
  "“If you could instantly wake up fluent in any language tomorrow, what would it be?”",
  "“What's a food combination you love that other people think is weird?”",
  "“What was the highlight of your week so far?”",
  "“If you had a teleportation button right now, where are we heading?”",
];

const MOODS: { id: CollieMood; label: string; icon: string }[] = [
  { id: 'tracking', label: 'Watch Cursor', icon: '👀' },
  { id: 'happy', label: 'Happy', icon: '＾◡＾' },
  { id: 'hearts', label: 'Hearts', icon: '💖' },
  { id: 'stars', label: 'Stars', icon: '✨' },
  { id: 'wink', label: 'Wink', icon: '😉' },
  { id: 'sleepy', label: 'Sleepy', icon: '😴' },
];

export const CollieScene: React.FC<CollieSceneProps> = () => {
  const [icebreakerIndex, setIcebreakerIndex] = useState(0);
  const [speechText, setSpeechText] = useState(ICEBREAKERS[0]);
  const [isSparkling, setIsSparkling] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [petCount, setPetCount] = useState(1);
  const [selectedMood, setSelectedMood] = useState<CollieMood>('tracking');
  const [particles, setParticles] = useState<FloatingParticle[]>([]);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const startDragPos = useRef<{ x: number; y: number } | null>(null);
  const [pupilOffset, setPupilOffset] = useState<PupilOffset>({ x: 0, y: 0 });
  const [isBlinking, setIsBlinking] = useState(false);
  const mascotRef = useRef<HTMLDivElement>(null);
  const { scaleX, scaleY, rotateZ } = calculateSquashStretch(dragOffset.x, dragOffset.y, isPressed);

  useEffect(() => {
    let blinkTimer: NodeJS.Timeout;
    const scheduleBlink = () => {
      const delay = 2500 + Math.random() * 3000;
      blinkTimer = setTimeout(() => {
        setIsBlinking(true);
        setTimeout(() => {
          setIsBlinking(false);
          if (Math.random() < 0.25) {
            setTimeout(() => {
              setIsBlinking(true);
              setTimeout(() => {
                setIsBlinking(false);
                scheduleBlink();
              }, 120);
            }, 100);
          } else {
            scheduleBlink();
          }
        }, 160);
      }, delay);
    };

    scheduleBlink();
    return () => clearTimeout(blinkTimer);
  }, []);

  useEffect(() => {
    const handleGlobalPointerMove = (e: MouseEvent | TouchEvent) => {
      if (!mascotRef.current) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      const rect = mascotRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width * 0.45;
      const centerY = rect.top + rect.height * 0.48;

      const offset = calculatePupilOffset(clientX, clientY, centerX, centerY, 7.5);
      setPupilOffset(offset);

      if (startDragPos.current) {
        const dx = clientX - startDragPos.current.x;
        const dy = clientY - startDragPos.current.y;
        setDragOffset({ x: dx * 0.4, y: dy * 0.4 });
      }
    };

    window.addEventListener('mousemove', handleGlobalPointerMove);
    window.addEventListener('touchmove', handleGlobalPointerMove, { passive: true });

    return () => {
      window.removeEventListener('mousemove', handleGlobalPointerMove);
      window.removeEventListener('touchmove', handleGlobalPointerMove);
    };
  }, []);

  const spawnParticle = useCallback((clientX?: number, clientY?: number) => {
    const symbols = ['💖', '✨', '🐾', '⭐', '🌸', '💫'];
    const colors = ['#ff85c0', '#74c0fc', '#ffd43b', '#69db7c', '#da77f2'];
    const id = Date.now() + Math.random();

    let x = 50 + (Math.random() * 30 - 15);
    let y = 40 + (Math.random() * 20 - 10);

    if (clientX && clientY && mascotRef.current) {
      const rect = mascotRef.current.getBoundingClientRect();
      x = ((clientX - rect.left) / rect.width) * 100;
      y = ((clientY - rect.top) / rect.height) * 100;
    }

    const newParticle: FloatingParticle = {
      id,
      x,
      y,
      char: symbols[Math.floor(Math.random() * symbols.length)],
      color: colors[Math.floor(Math.random() * colors.length)],
    };

    setParticles((prev) => [...prev.slice(-12), newParticle]);
    setTimeout(() => {
      setParticles((prev) => prev.filter((p) => p.id !== id));
    }, 1200);
  }, []);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsPressed(true);
    startDragPos.current = { x: e.clientX, y: e.clientY };
    const pitch = 0.9 + Math.random() * 0.35;
    collieAudio.playSquish(pitch);
    spawnParticle(e.clientX, e.clientY);
    setPetCount((prev) => {
      const next = prev + 1;
      const quip = getColliePetReaction(next);
      setSpeechText(quip);
      return next;
    });
    (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isPressed) {
      collieAudio.playBoing();
      spawnParticle(e.clientX, e.clientY);
    }
    setIsPressed(false);
    startDragPos.current = null;
    setDragOffset({ x: 0, y: 0 });

    try {
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    } catch {
    }
  };

  const toggleSound = () => {
    const next = !isMuted;
    setIsMuted(next);
    collieAudio.setMuted(next);
    if (!next) {
      collieAudio.playSparkle();
    }
  };

  const cycleIcebreaker = () => {
    setIsSparkling(true);
    collieAudio.playSparkle();
    const nextIdx = (icebreakerIndex + 1) % ICEBREAKERS.length;
    setIcebreakerIndex(nextIdx);
    setSpeechText(ICEBREAKERS[nextIdx]);
    setTimeout(() => setIsSparkling(false), 500);
  };

  return (
    <div className="relative z-20 flex flex-col items-center justify-center lg:items-end w-full select-none">
      <div
        className="pointer-events-none fixed inset-0 overflow-hidden -z-10"
        aria-hidden="true"
      >
        <div
          className="absolute top-[8%] left-[7%] w-4 h-2.5 rounded-[60%_40%_70%_30%] bg-gradient-to-r from-pink-300 via-pink-200 to-pink-100 shadow-xs animate-petal-1 opacity-80"
          style={{ animationDelay: '0s' }}
        />
        <div
          className="absolute top-[16%] left-[22%] w-3.5 h-2 rounded-[50%_50%_70%_30%] bg-gradient-to-br from-pink-200 to-pink-300/80 shadow-xs animate-petal-2 opacity-75"
          style={{ animationDelay: '2.5s' }}
        />
        <div
          className="absolute top-[10%] left-[46%] w-4 h-2 rounded-[60%_40%_60%_40%] bg-pink-200/80 shadow-xs animate-petal-1 opacity-70"
          style={{ animationDelay: '5s' }}
        />
        <div
          className="absolute top-[14%] right-[16%] w-3.5 h-2.5 rounded-[40%_60%_70%_30%] bg-gradient-to-l from-pink-300 to-pink-100/70 shadow-xs animate-petal-2 opacity-75"
          style={{ animationDelay: '1.2s' }}
        />
        <div
          className="absolute top-[40%] left-[10%] w-3 h-2 rounded-[50%_50%_60%_40%] bg-pink-300/85 shadow-xs animate-petal-1 opacity-80"
          style={{ animationDelay: '7s' }}
        />
        <div
          className="absolute top-[36%] right-[20%] w-4 h-2.5 rounded-[70%_30%_60%_40%] bg-gradient-to-r from-pink-200 to-pink-300/90 shadow-xs animate-petal-2 opacity-85"
          style={{ animationDelay: '3.8s' }}
        />
        <div
          className="absolute top-[66%] left-[30%] w-3.5 h-2 rounded-[60%_40%_50%_50%] bg-pink-200/75 shadow-xs animate-petal-1 opacity-70"
          style={{ animationDelay: '8.5s' }}
        />
        <div
          className="absolute top-[60%] right-[12%] w-3 h-1.5 rounded-[40%_60%_50%_50%] bg-pink-300/70 shadow-xs animate-petal-2 opacity-65"
          style={{ animationDelay: '4.2s' }}
        />
      </div>

      <div className="relative flex flex-col items-center lg:items-end w-full">
        <div
          onClick={cycleIcebreaker}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') cycleIcebreaker(); }}
          aria-label="Collie's speech bubble. Click for a new conversation icebreaker"
          className="relative max-w-[290px] xs:max-w-[320px] sm:max-w-[340px] p-4 sm:p-5 rounded-2xl sm:rounded-3xl glass-surface cursor-pointer mb-2 sm:mb-2 lg:-mr-12 xl:-mr-16 animate-bubble-in transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <span className="text-[14px] font-semibold text-[#1B1B3A] dark:text-white">
                Hi, I'm Collie!
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-300 animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-[11px] font-medium text-[#6FA8FF] opacity-90 group-hover:opacity-100 transition-opacity">
              <RefreshCw className={`w-3 h-3 ${isSparkling ? 'animate-spin' : ''}`} />
              <span>Tap for tip</span>
            </div>
          </div>

          <p className="text-[12px] font-semibold uppercase tracking-wider text-[#6FA8FF] dark:text-[#9fc4ff] mb-1">
            Your Collide Guide
          </p>

          <p className="text-[13px] sm:text-[13.5px] leading-relaxed text-[#4B4A68] dark:text-slate-200">
            {speechText}
          </p>
          <svg
            className="absolute -bottom-2.5 right-12 sm:right-16 w-4 h-3 text-white/50 dark:text-[#181832]/75 fill-current"
            viewBox="0 0 16 12"
            aria-hidden="true"
          >
            <path d="M0,0 L16,0 L9,11 C8.5,12 7.5,12 7,11 Z" />
          </svg>
        </div>
        <div
          ref={mascotRef}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          onPointerEnter={() => setIsHovered(true)}
          onPointerLeave={() => {
            setIsHovered(false);
            if (isPressed) {
              setIsPressed(false);
              setDragOffset({ x: 0, y: 0 });
            }
          }}
          className="relative w-[55vw] max-w-[250px] sm:max-w-[280px] lg:w-[280px] xl:w-[310px] aspect-[1/0.88] mx-auto lg:mx-0 flex items-center justify-center cursor-grab active:cursor-grabbing group touch-none select-none transition-transform"
          style={{
            transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0) scale3d(${scaleX}, ${scaleY}, 1) rotate(${rotateZ}deg)`,
            transition: isPressed ? 'none' : 'transform 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
            transformOrigin: '50% 85%',
          }}
          title="Collie — Squish, drag, or poke me! My eyes track your cursor!"
        >
          <div
            className={`absolute w-[80%] h-[80%] rounded-full bg-[#6FA8FF]/25 dark:bg-[#6FA8FF]/30 blur-2xl -z-10 transition-all duration-300 ${isPressed ? 'scale-125 bg-[#6FA8FF]/50 blur-3xl' : 'group-hover:bg-[#6FA8FF]/35'
              }`}
            aria-hidden="true"
          />
          <img
            src="/assets/landing/collie.webp"
            alt="Collie: A friendly white robot cat mascot with glowing blue visor eyes, halo rings, and a flowing lavender scarf"
            className="w-full h-full object-contain filter drop-shadow-[0_12px_24px_rgba(110,130,220,0.25)] dark:drop-shadow-[0_12px_24px_rgba(30,20,70,0.6)] pointer-events-none select-none"
            width={340}
            height={300}
            draggable={false}
          />
          <CollieFace
            pupilOffset={pupilOffset}
            mood={selectedMood}
            isBlinking={isBlinking}
            isPressed={isPressed}
            isHovered={isHovered}
          />
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="absolute pointer-events-none text-xl sm:text-2xl animate-bounce"
              style={{
                left: `${particle.x}%`,
                top: `${particle.y}%`,
                color: particle.color,
                animation: 'particleFloat 1.1s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {particle.char}
            </div>
          ))}
        </div>
        <div className="flex flex-col items-center lg:items-end gap-1.5 mt-1 mb-1 sm:mb-0 w-full max-w-[340px] px-1">
          <div className="flex items-center justify-between w-full px-3 py-1.5 rounded-full glass-surface text-xs text-[#4B4A68] dark:text-slate-300">
            <button
              type="button"
              onClick={() => {
                const pitch = 0.95 + Math.random() * 0.3;
                collieAudio.playSquish(pitch);
                spawnParticle();
                setPetCount((p) => {
                  const next = p + 1;
                  setSpeechText(getColliePetReaction(next));
                  return next;
                });
              }}
              className="flex items-center gap-1.5 font-semibold text-[#1B1B3A] dark:text-white hover:text-[#6FA8FF] dark:hover:text-[#6FA8FF] transition-colors cursor-pointer"
              title="Click to pet and squish Collie!"
            >
              <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-400 animate-pulse" />
              <span>{petCount} {petCount === 1 ? 'Squish' : 'Squishes'}</span>
            </button>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-[#6FA8FF] font-medium hidden sm:inline">
                {isPressed ? 'Squishing!' : 'Squish or drag me!'}
              </span>
              <button
                type="button"
                onClick={toggleSound}
                className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
                title={isMuted ? 'Unmute squish squeaks' : 'Mute squish squeaks'}
                aria-label={isMuted ? 'Unmute squish sound' : 'Mute squish sound'}
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#6FA8FF]" />}
              </button>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1 p-1 rounded-full bg-white/40 dark:bg-black/30 backdrop-blur-md border border-white/40 dark:border-white/10 shadow-xs overflow-x-auto max-w-full">
            {MOODS.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedMood(m.id);
                  collieAudio.playSparkle();
                  if (m.id === 'hearts') setSpeechText("I love you too bruv! ♡");
                  else if (m.id === 'stars') setSpeechText("Look at us shine! ★");
                  else if (m.id === 'wink') setSpeechText("Right back at ya! 😉");
                  else if (m.id === 'sleepy') setSpeechText("Nap time... zzz ☁️");
                  else if (m.id === 'happy') setSpeechText("Best day ever! ＾◡＾");
                  else setSpeechText("Watching your pointer wherever you go! 👀");
                }}
                className={`px-2 py-0.5 rounded-full text-[11px] font-medium transition-all ${selectedMood === m.id
                    ? 'bg-[#15152B] text-white shadow-xs dark:bg-white dark:text-[#15152B]'
                    : 'text-[#4B4A68] dark:text-slate-300 hover:bg-white/60 dark:hover:bg-white/15'
                  }`}
                title={`Switch Collie's eye expression to ${m.label}`}
              >
                <span className="mr-0.5">{m.icon}</span>
                <span className="hidden xs:inline">{m.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
