import React from 'react';
import { X, Heart, MessageSquare, Trash2, Globe, Sparkles } from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStartChatWith: (partnerId: string) => void;
}

export const ConnectionsModal: React.FC<ConnectionsModalProps> = ({
  isOpen,
  onClose,
  onStartChatWith,
}) => {
  const { savedConnections, removeConnection, clearAllConnections } = useSocialDiscovery();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-in fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby="connections-title"
    >
      <div
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl glass-surface border border-white/80 dark:border-white/20 shadow-2xl bg-white/95 dark:bg-[#15152B]/95 text-[#1B1B3A] dark:text-white max-h-[85vh] flex flex-col no-scrollbar [&::-webkit-scrollbar]:hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full glass-pill"
          aria-label="Close connections dialog"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <span className="p-1.5 rounded-full bg-purple-500/20 text-purple-600">
            <Heart className="w-4 h-4 fill-current" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-wider text-purple-600">
            Mutual Connections
          </span>
        </div>

        <h3 id="connections-title" className="font-serif text-2xl font-medium mb-1">
          My Connections ({savedConnections.length})
        </h3>
        <p className="text-xs text-[#4B4A68] dark:text-slate-300 mb-6">
          People you connected with by mutual consent. Encrypted and stored pseudonomously on your device.
        </p>

        {savedConnections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-14 h-14 rounded-full glass-surface flex items-center justify-center text-[#6FA8FF] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-semibold text-sm mb-1">No mutual connections yet</h4>
            <p className="text-xs text-[#4B4A68] dark:text-slate-400 max-w-xs mb-4">
              During any chat, tap the "Connect" button. If the stranger accepts, you'll be connected here!
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1">
            {savedConnections.map((conn) => (
              <div
                key={conn.id}
                className="p-3.5 rounded-2xl bg-white/40 dark:bg-white/5 border border-white/70 dark:border-white/10 flex items-center justify-between gap-3 transition-all hover:bg-white/60 dark:hover:bg-white/10"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={conn.partnerAvatar}
                    alt={conn.partnerName}
                    className="w-11 h-11 rounded-full object-cover ring-2 ring-white/80"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-[#1B1B3A] dark:text-white">
                      {conn.partnerName}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-[#4B4A68] dark:text-slate-400">
                      <Globe className="w-3 h-3" />
                      <span>{conn.partnerCountry}</span>
                    </div>
                    {conn.sharedInterests.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {conn.sharedInterests.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#6FA8FF]/15 text-[#6FA8FF]"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onClose();
                      onStartChatWith(conn.partnerId);
                    }}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3" />
                    <span>Chat</span>
                  </button>
                  <button
                    onClick={() => removeConnection(conn.id)}
                    className="p-1.5 rounded-full hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                    title="Remove connection"
                    aria-label={`Remove connection with ${conn.partnerName}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="pt-4 mt-2 border-t border-white/40 dark:border-white/10 flex items-center justify-between">
          {savedConnections.length > 0 ? (
            <button
              onClick={clearAllConnections}
              className="text-xs text-rose-500 hover:text-rose-600 font-medium cursor-pointer"
            >
              Clear All
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-full text-xs font-semibold glass-pill cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
