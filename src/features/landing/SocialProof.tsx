import React from 'react';
import { usePresenceCount } from '../../hooks/usePresenceCount';

interface SocialProofProps {
  showPresence?: boolean;
}

const AVATARS = [
  { src: '/assets/landing/avatar-1.webp', alt: 'Community member avatar 1' },
  { src: '/assets/landing/avatar-2.webp', alt: 'Community member avatar 2' },
  { src: '/assets/landing/avatar-3.webp', alt: 'Community member avatar 3' },
  { src: '/assets/landing/avatar-4.webp', alt: 'Community member avatar 4' },
];

export const SocialProof: React.FC<SocialProofProps> = ({ showPresence = true }) => {
  const { formattedCount, activeLabel } = usePresenceCount();

  if (!showPresence) return null;

  return (
    <div
      className="flex items-center gap-2.5 sm:gap-3.5 mt-4 sm:mt-8 select-none flex-wrap"
      aria-label={`${formattedCount} ${activeLabel} currently active`}
    >
      <div className="flex items-center -space-x-2.5">
        {AVATARS.map((avatar, idx) => (
          <img
            key={idx}
            src={avatar.src}
            alt={avatar.alt}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full object-cover ring-2 ring-white/90 dark:ring-slate-900/80 shadow-sm transition-transform hover:scale-110 hover:z-10"
            loading="lazy"
          />
        ))}
      </div>
      <div className="hidden xs:block h-4 w-[1px] bg-[#1B1B3A]/20 dark:bg-white/20" />
      <div className="flex items-center gap-2 text-[13px] md:text-[14px] font-medium text-[#1B1B3A] dark:text-slate-100">
        <span className="relative flex h-2.5 w-2.5" aria-hidden="true">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#34C77B] opacity-75" />
          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#34C77B]" />
        </span>
        <span className="tabular-nums font-semibold text-[#1B1B3A] dark:text-white">
          {formattedCount}
        </span>
        <span className="text-[#4B4A68] dark:text-slate-300">
          {activeLabel}
        </span>
      </div>
    </div>
  );
};
