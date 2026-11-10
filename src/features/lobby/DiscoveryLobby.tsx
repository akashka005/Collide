import React, { useState } from 'react';
import { Video, MessageCircle, Sparkles, Dices, Globe, User, ShieldCheck, ArrowRight, X, Loader2, ChevronDown } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { AVAILABLE_TOPICS, AVAILABLE_LANGUAGES, getLanguageLabel } from '../../lib/matchmaking';
import { ChatMode, MatchAlgorithm } from '../../types';

interface DiscoveryLobbyProps {
  onBackToLanding: () => void;
  onEnterChat: () => void;
}

export const DiscoveryLobby: React.FC<DiscoveryLobbyProps> = ({ onBackToLanding, onEnterChat }) => {
  const {
    userProfile,
    updateUserProfile,
    startSearching,
    matchStatus,
    cancelSearching,
  } = useSocialDiscovery();

  const [selectedMode, setSelectedMode] = useState<ChatMode>('video');
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<MatchAlgorithm>('smart');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [customName, setCustomName] = useState(userProfile.pseudonym);

  const toggleTopic = (topic: string) => {
    const current = userProfile.interests;
    const exists = current.includes(topic);
    const updated = exists ? current.filter((t) => t !== topic) : [...current, topic];
    updateUserProfile({ interests: updated });
  };

  const handleSaveProfile = () => {
    if (customName.trim()) {
      updateUserProfile({ pseudonym: customName.trim() });
    }
    setIsEditingProfile(false);
  };

  const handleStartQueue = () => {
    startSearching(selectedMode, selectedAlgorithm);
    onEnterChat();
  };

  return (
    <div className="relative min-h-[calc(100vh-72px)] w-full flex flex-col items-center justify-center px-4 sm:px-6 py-8">
      <div className="relative z-20 w-full max-w-3xl p-6 sm:p-10 rounded-3xl glass-surface border border-white/70 dark:border-white/15 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between mb-6 pb-5 border-b border-white/40 dark:border-white/10">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full glass-surface text-xs font-semibold text-[#6FA8FF] mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Discovery Lounge</span>
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl text-[#1B1B3A] dark:text-white font-medium">
              Find Your Next Conversation
            </h1>
          </div>
          <button
            onClick={onBackToLanding}
            aria-label="Back to home"
            className="p-2 rounded-full glass-pill text-[#1B1B3A] dark:text-white hover:bg-white/40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60 dark:border-white/10 mb-8">
          <div className="flex items-center gap-3">
            <img
              src={userProfile.avatarUrl}
              alt={userProfile.pseudonym}
              className="w-10 h-10 rounded-full ring-2 ring-white/80 object-cover"
            />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-[#1B1B3A] dark:text-white">
                  {userProfile.pseudonym}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                  18+ Verified
                </span>
              </div>
              <span className="text-xs text-[#4B4A68] dark:text-slate-400">
                Anonymous Session · Peer-to-Peer
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditingProfile(!isEditingProfile)}
            className="text-xs font-medium px-3 py-1.5 rounded-full glass-pill text-[#1B1B3A] dark:text-white"
          >
            {isEditingProfile ? 'Cancel' : 'Edit Alias'}
          </button>
        </div>
        {isEditingProfile && (
          <div className="p-4 rounded-2xl bg-white/60 dark:bg-white/10 border border-white/80 mb-6 flex items-center gap-3 animate-in fade-in">
            <User className="w-4 h-4 text-[#6FA8FF]" />
            <input
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter your anonymous nickname"
              className="flex-1 bg-transparent border-b border-[#1B1B3A]/30 dark:border-white/30 text-sm py-1 focus:outline-none focus:border-[#6FA8FF]"
              maxLength={24}
            />
            <button
              onClick={handleSaveProfile}
              className="px-4 py-1.5 rounded-full text-xs font-semibold bg-[#15152B] text-white dark:bg-white dark:text-[#15152B]"
            >
              Save
            </button>
          </div>
        )}
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-300 mb-3">
            1. Select Experience Mode
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setSelectedMode('video')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer ${selectedMode === 'video'
                  ? 'border-[#6FA8FF] bg-white/80 dark:bg-white/15 shadow-md ring-2 ring-[#6FA8FF]/30'
                  : 'border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50'
                }`}
            >
              <div className={`p-3 rounded-xl ${selectedMode === 'video' ? 'bg-[#6FA8FF] text-white' : 'glass-surface text-[#1B1B3A] dark:text-white'}`}>
                <Video className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#1B1B3A] dark:text-white mb-0.5">
                  Live Video & Audio
                </h3>
                <p className="text-xs leading-relaxed text-[#4B4A68] dark:text-slate-300">
                  Face-to-face random connections with optional camera toggle and instant skip.
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode('text')}
              className={`flex items-start gap-3.5 p-4 rounded-2xl border transition-all text-left cursor-pointer ${selectedMode === 'text'
                  ? 'border-[#6FA8FF] bg-white/80 dark:bg-white/15 shadow-md ring-2 ring-[#6FA8FF]/30'
                  : 'border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 hover:bg-white/50'
                }`}
            >
              <div className={`p-3 rounded-xl ${selectedMode === 'text' ? 'bg-[#6FA8FF] text-white' : 'glass-surface text-[#1B1B3A] dark:text-white'}`}>
                <MessageCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-[#1B1B3A] dark:text-white mb-0.5">
                  Private Text Lounge
                </h3>
                <p className="text-xs leading-relaxed text-[#4B4A68] dark:text-slate-300">
                  Instant messaging, typing status, interactive games, and Collie icebreakers.
                </p>
              </div>
            </button>
          </div>
        </div>
        <div className="mb-8">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-300 mb-3">
            2. Matchmaking Algorithm
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <button
              type="button"
              onClick={() => setSelectedAlgorithm('smart')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-medium transition-all ${selectedAlgorithm === 'smart'
                  ? 'border-[#15152B] dark:border-white bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-sm'
                  : 'border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 text-[#1B1B3A] dark:text-white hover:bg-white/50'
                }`}
            >
              <Sparkles className="w-4 h-4 text-[#6FA8FF]" />
              <span>Smart Interest Matching (Recommended)</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedAlgorithm('random')}
              className={`flex items-center gap-3 p-3.5 rounded-2xl border text-sm font-medium transition-all ${selectedAlgorithm === 'random'
                  ? 'border-[#15152B] dark:border-white bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-sm'
                  : 'border-white/50 dark:border-white/10 bg-white/30 dark:bg-white/5 text-[#1B1B3A] dark:text-white hover:bg-white/50'
                }`}
            >
              <Dices className="w-4 h-4 text-amber-500" />
              <span>Spontaneous (Wildcard Random)</span>
            </button>
          </div>
        </div>
        {selectedAlgorithm === 'smart' && (
          <div className="mb-8 animate-in fade-in duration-200">
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-300">
                3. Your Interests & Passions ({userProfile.interests.length} selected)
              </label>
              <span className="text-xs text-[#6FA8FF] font-medium">
                Tap to toggle
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_TOPICS.map((topic) => {
                const isSelected = userProfile.interests.includes(topic);
                return (
                  <button
                    key={topic}
                    type="button"
                    onClick={() => toggleTopic(topic)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${isSelected
                        ? 'bg-[#6FA8FF] text-white shadow-xs font-semibold scale-[1.02]'
                        : 'glass-surface text-[#1B1B3A] dark:text-white hover:bg-white/60'
                      }`}
                  >
                    {isSelected ? `✓ ${topic}` : topic}
                  </button>
                );
              })}
            </div>
          </div>
        )}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#4B4A68] dark:text-slate-300">
              Language Preference
            </label>
            <span className="text-[11px] text-[#6FA8FF] font-medium">
              {userProfile.language === 'any' ? 'Global Matchmaking' : 'Targeted Language'}
            </span>
          </div>

          <div className="relative inline-block w-full sm:w-80">
            <Globe className="absolute left-3.5 top-3 w-4 h-4 text-[#6FA8FF] pointer-events-none z-10" />
            <select
              value={userProfile.language || 'en'}
              onChange={(e) => updateUserProfile({ language: e.target.value })}
              className="w-full pl-10 pr-10 py-2.5 rounded-2xl glass-surface border border-white/70 dark:border-white/10 text-sm font-semibold text-[#1B1B3A] dark:text-white bg-white/60 dark:bg-[#15152B]/70 shadow-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]/40 transition-all"
            >
              {AVAILABLE_LANGUAGES.map((l) => (
                <option key={l.code} value={l.code} className="bg-white dark:bg-[#15152B] text-slate-900 dark:text-white py-1">
                  {l.flag} {l.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3.5 top-3 w-4 h-4 text-[#4B4A68] dark:text-slate-400 pointer-events-none" />
          </div>

          <p className="text-[11px] text-[#4B4A68] dark:text-slate-400 mt-2">
            {userProfile.language === 'any'
              ? '🌎 Matches you instantly with conversation partners worldwide across all languages.'
              : `🎯 Prioritizes matching you with other ${getLanguageLabel(userProfile.language)} speakers before falling back to international peers.`}
          </p>
        </div>
        <div className="pt-2">
          {matchStatus === 'searching' ? (
            <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/60">
              <Loader2 className="w-8 h-8 text-[#6FA8FF] animate-spin mb-3" />
              <p className="font-semibold text-sm text-[#1B1B3A] dark:text-white mb-1">
                Collie is finding your compatible stranger...
              </p>
              <p className="text-xs text-[#4B4A68] dark:text-slate-400 mb-4">
                Searching queues for {selectedMode} chat
              </p>
              <button
                onClick={cancelSearching}
                className="px-5 py-2 rounded-full text-xs font-medium glass-pill text-[#1B1B3A] dark:text-white"
              >
                Cancel Search
              </button>
            </div>
          ) : (
            <button
              onClick={handleStartQueue}
              className="group w-full py-4 px-6 rounded-full text-base font-semibold text-white bg-[#15152B] hover:bg-[#252542] dark:bg-white dark:text-[#15152B] dark:hover:bg-slate-100 shadow-xl transition-all duration-200 flex items-center justify-center gap-3 cursor-pointer"
            >
              <Sparkles className="w-5 h-5 text-[#6FA8FF]" />
              <span>Start {selectedMode === 'video' ? 'Video' : 'Text'} Discovery</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          )}
        </div>

        {/* Safety Note */}
        <div className="mt-5 flex items-center justify-center gap-2 text-[11.5px] text-[#4B4A68] dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>No phone number or profile required. Skip or disconnect anytime.</span>
        </div>
      </div>
    </div>
  );
};