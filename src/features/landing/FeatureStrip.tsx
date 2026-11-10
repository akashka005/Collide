import React from 'react';
import { Video, MessageCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface FeatureItem {
  icon: React.ElementType;
  title: string;
  caption: string;
}

const FEATURES: FeatureItem[] = [
  {
    icon: Video,
    title: 'Video Chat',
    caption: 'Meet face-to-face in real time.',
  },
  {
    icon: MessageCircle,
    title: 'Text Chat',
    caption: 'Start conversations instantly.',
  },
  {
    icon: Sparkles,
    title: 'Smart Match',
    caption: 'Find people with similar interests.',
  },
  {
    icon: ShieldCheck,
    title: 'Safe & Secure',
    caption: 'Reporting, blocking and moderation built in.',
  },
];

interface FeatureStripProps {
  onSelectFeature?: (title: string) => void;
}

export const FeatureStrip: React.FC<FeatureStripProps> = ({ onSelectFeature }) => {
  return (
    <section
      id="feature-strip"
      className="relative z-20 w-full mt-auto pt-1 sm:pt-2 pb-2 sm:pb-3 px-4 sm:px-8 max-w-6xl mx-auto"
      aria-label="Collide Core Features"
    >
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-0 items-start">
        {FEATURES.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <div
              key={feature.title}
              onClick={() => onSelectFeature?.(feature.title)}
              className={`flex flex-col items-center text-center px-2 sm:px-5 py-1.5 group cursor-pointer ${idx !== FEATURES.length - 1
                  ? 'md:border-r md:border-white/40 dark:md:border-white/10'
                  : ''
                }`}
            >
              <div className="flex items-center justify-center w-13 h-13 sm:w-14 sm:h-14 rounded-full glass-surface mb-2.5 shadow-xs transition-all duration-300 group-hover:scale-110 group-hover:shadow-md group-hover:bg-white/60 dark:group-hover:bg-white/20">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-[#1B1B3A] dark:text-white group-hover:text-[#6FA8FF] transition-colors" />
              </div>
              <h2 className="text-[16px] sm:text-[17.5px] font-semibold text-[#1B1B3A] dark:text-white mb-0.5 tracking-tight">
                {feature.title}
              </h2>
              <p className="text-[12.5px] sm:text-[13.5px] leading-snug text-[#4B4A68] dark:text-slate-300 max-w-[200px]">
                {feature.caption}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
