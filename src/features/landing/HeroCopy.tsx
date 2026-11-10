import React from 'react';
import { Video, ArrowRight, Play, Sparkles } from 'lucide-react';
import { SocialProof } from './SocialProof';

interface HeroCopyProps {
  onStartChatting: () => void;
  onSeeHowItWorks: () => void;
  showPresence?: boolean;
}

export const HeroCopy: React.FC<HeroCopyProps> = ({
  onStartChatting,
  onSeeHowItWorks,
  showPresence = true,
}) => {
  return (
    <div className="relative z-20 flex flex-col max-w-[600px] pt-1 sm:pt-2 pb-1">
      <div
        className="absolute -inset-10 -z-10 rounded-full bg-white/70 dark:bg-transparent blur-3xl pointer-events-none transition-colors duration-500"
        aria-hidden="true"
      />
      <div className="inline-flex items-center gap-2 px-3 py-1 sm:px-3.5 sm:py-1 rounded-full glass-surface w-fit mb-2 sm:mb-3 shadow-xs">
        <Sparkles className="w-3.5 h-3.5 text-[#6FA8FF]" />
        <span className="text-[11.5px] sm:text-[12.5px] font-medium tracking-wide text-[#1B1B3A] dark:text-slate-200">
          Meet <span className="opacity-40">·</span> Chat <span className="opacity-40">·</span> Connect
        </span>
      </div>
      <h1 className="font-serif tracking-tight text-[36px] xs:text-[40px] sm:text-[52px] lg:text-[62px] xl:text-[68px] leading-[1.05] mb-2 sm:mb-3">
        <span className="block font-normal text-[#1B1B3A] dark:text-white">
          Strangers Today.
        </span>
        <span className="block italic font-normal text-[#535272] dark:text-[#A7C5EB] tracking-tight">
          Possibilities Tomorrow.
        </span>
      </h1>
      <p className="text-[13px] sm:text-[16px] leading-[1.4] sm:leading-[1.45] text-[#4B4A68] dark:text-slate-300 max-w-[440px] mb-3 sm:mb-5 font-normal">
        Meet real people from around the world through text or video. Safe, simple, and built for meaningful random connections.
      </p>
      <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
        <button
          onClick={onStartChatting}
          className="group flex items-center gap-2.5 px-6 py-3.5 rounded-full text-[15px] font-medium text-white bg-[#15152B] dark:bg-white dark:text-[#15152B] shadow-lg shadow-[#15152B]/15 hover:bg-[#252542] dark:hover:bg-slate-100 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 cursor-pointer"
        >
          <Video className="w-4 h-4 text-[#6FA8FF] dark:text-[#4A86E8]" />
          <span>Start Chatting</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
        <button
          onClick={onSeeHowItWorks}
          className="group flex items-center gap-2 px-5 py-3.5 rounded-full text-[15px] font-medium text-[#1B1B3A] dark:text-white glass-pill cursor-pointer"
        >
          <Play className="w-3.5 h-3.5 fill-current opacity-80 transition-transform duration-200 group-hover:scale-110" />
          <span>See How It Works</span>
        </button>
      </div>
      <SocialProof showPresence={showPresence} />
    </div>
  );
};
