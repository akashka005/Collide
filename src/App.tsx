import React, { useState, useEffect } from 'react';
import { SocialDiscoveryProvider, useSocialDiscovery } from './context/SocialDiscoveryContext';
import { LandingNav } from './features/landing/LandingNav';
import { HeroCopy } from './features/landing/HeroCopy';
import { CollieScene } from './features/landing/CollieScene';
import { FeatureStrip } from './features/landing/FeatureStrip';
import { DiscoveryLobby } from './features/lobby/DiscoveryLobby';
import { ActiveChatView } from './features/chat/ActiveChatView';
import { ConnectionsModal } from './features/connections/ConnectionsModal';
import { ModerationDashboard } from './features/moderation/ModerationDashboard';
import { ReportModal } from './features/safety/ReportModal';
import { HowItWorksModal } from './features/landing/modals/HowItWorksModal';
import { SafetyModal } from './features/landing/modals/SafetyModal';
import { AuthModal } from './features/auth/AuthModal';
import { AgeGate } from './components/AgeGate';

type AppView = 'landing' | 'lobby' | 'chat';

function AppContent() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [ageVerified, setAgeVerified] = useState(() => {
    return localStorage.getItem('collide_age_verified') === 'true';
  });
  
  // Modals
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);
  const [isSafetyOpen, setIsSafetyOpen] = useState(false);
  const [isConnectionsOpen, setIsConnectionsOpen] = useState(false);
  const [isModerationOpen, setIsModerationOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');

  const {
    matchStatus,
    startSearching,
    savedConnections,
  } = useSocialDiscovery();

  // Dark mode sync
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Handle CTA transitions
  const handleStartChatting = (mode: 'video' | 'text' = 'video') => {
    startSearching(mode, 'smart');
    setCurrentView('chat');
  };

  const handleOpenLobby = () => {
    setCurrentView('lobby');
  };

  const handleSelectFeature = (featureTitle: string) => {
    if (featureTitle === 'Video Chat') {
      handleStartChatting('video');
    } else if (featureTitle === 'Text Chat') {
      handleStartChatting('text');
    } else if (featureTitle === 'Safe & Secure') {
      setIsSafetyOpen(true);
    } else {
      setCurrentView('lobby');
    }
  };

  return (
    <div 
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      className={`relative ${currentView === 'landing' ? 'min-h-screen md:h-screen md:max-h-screen md:overflow-hidden overflow-y-auto no-scrollbar [&::-webkit-scrollbar]:hidden' : 'min-h-screen overflow-x-hidden no-scrollbar [&::-webkit-scrollbar]:hidden'} w-full flex flex-col justify-between no-scrollbar ${isDarkMode ? 'dark' : ''}`}
    >
      {/* Age Gate — shown until verified */}
      {!ageVerified && (
        <AgeGate onVerified={() => setAgeVerified(true)} />
      )}
      {/* Full-Bleed 16:9 Pastel Sky Landscape Background (PRESERVED THEME) */}
      <div className="fixed inset-0 -z-30 w-full h-full overflow-hidden select-none">
        <img
          src="/assets/landing/bg-scene.webp"
          alt=""
          aria-hidden="true"
          className="w-full h-full object-cover object-[82%_42%] sm:object-[80%_center] lg:object-right transition-transform duration-1000 scale-[1.01]"
          fetchPriority="high"
        />
        {/* Night Mode Deep Navy-Violet Overlay */}
        <div 
          className={`absolute inset-0 transition-opacity duration-700 pointer-events-none ${
            isDarkMode 
              ? 'opacity-85 bg-gradient-to-b from-[#0c0c1e] via-[#12122d]/85 to-[#0b0b1c]' 
              : 'opacity-0'
          }`}
          aria-hidden="true"
        />
        {/* Soft day lighting gradient vignette */}
        <div 
          className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
            isDarkMode ? 'opacity-30 bg-black/40' : 'opacity-10 bg-indigo-900/10'
          }`}
          aria-hidden="true"
        />
      </div>

      {/* 1. Global Navigation Bar */}
      <LandingNav
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onOpenEnter={handleOpenLobby}
        onOpenHowItWorks={() => setIsHowItWorksOpen(true)}
        onOpenSafety={() => setIsSafetyOpen(true)}
        onOpenConnections={() => setIsConnectionsOpen(true)}
        onOpenModeration={() => setIsModerationOpen(true)}
        onOpenAuth={(mode) => {
          setAuthMode(mode);
          setIsAuthOpen(true);
        }}
        savedConnectionsCount={savedConnections.length}
      />

      {/* 2. Main View Switcher */}
      {currentView === 'landing' && (
        <>
          <main className="relative z-10 flex-1 flex flex-col justify-center w-full max-w-7xl mx-auto px-4 sm:px-8 lg:px-16 pt-0 sm:pt-1 pb-1 sm:pb-2">
            <div className="flex flex-col lg:flex-row items-center lg:items-center justify-between gap-3 sm:gap-6 lg:gap-8">
              <HeroCopy
                onStartChatting={() => handleStartChatting('video')}
                onSeeHowItWorks={() => setIsHowItWorksOpen(true)}
                showPresence={true}
              />
              <div className="w-full lg:w-[48%] flex justify-center lg:justify-end mt-2 sm:mt-4 lg:mt-0 mb-1 sm:mb-4 lg:mb-0">
                <CollieScene />
              </div>
            </div>
          </main>
          <FeatureStrip onSelectFeature={handleSelectFeature} />
        </>
      )}

      {currentView === 'lobby' && (
        <DiscoveryLobby
          onBackToLanding={() => setCurrentView('landing')}
          onEnterChat={() => setCurrentView('chat')}
        />
      )}

      {currentView === 'chat' && (
        <ActiveChatView
          onLeave={() => setCurrentView('lobby')}
          onOpenReport={() => setIsReportOpen(true)}
        />
      )}

      {/* 3. Global Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
      />

      <ConnectionsModal
        isOpen={isConnectionsOpen}
        onClose={() => setIsConnectionsOpen(false)}
        onStartChatWith={() => {
          handleStartChatting('text');
        }}
      />

      <ModerationDashboard
        isOpen={isModerationOpen}
        onClose={() => setIsModerationOpen(false)}
      />

      <ReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
      />

      <HowItWorksModal
        isOpen={isHowItWorksOpen}
        onClose={() => setIsHowItWorksOpen(false)}
        onStartChatting={() => handleStartChatting('video')}
      />

      <SafetyModal
        isOpen={isSafetyOpen}
        onClose={() => setIsSafetyOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <SocialDiscoveryProvider>
      <AppContent />
    </SocialDiscoveryProvider>
  );
}
