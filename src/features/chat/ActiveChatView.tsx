import React, { useState, useEffect, useRef } from 'react';
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  SkipForward,
  LogOut,
  Send,
  Sparkles,
  Gamepad2,
  UserPlus,
  Check,
  ShieldAlert,
  ShieldBan,
  ChevronDown,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Trash2,
  Radio,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { useSocialDiscovery } from '../../context/SocialDiscoveryContext';
import { TicTacToeGame } from '../games/TicTacToeGame';
import { TriviaGame } from '../games/TriviaGame';
import { WouldYouRatherGame } from '../games/WouldYouRatherGame';
import { COPILOT_ICEBREAKERS } from '../../lib/games';
import { getLanguageFlag, getLanguageLabel } from '../../lib/matchmaking';
import { EmojiReaction } from '../../components/EmojiReaction';
import { synthesizeVoiceNote } from '../../lib/voice_audio';

const EMOJI_MAP: Record<string, string> = {
  'waving-hand': '👋',
  'sparkles': '✨',
  'face-with-tears-of-joy': '😂',
  'fire': '🔥',
  'raising-hands': '🙌',
  'video-game': '🎮',
  'smiling-face-with-hearts': '🥰',
  'star-struck': '🤩',
  'confused-face': '😕',
  'pleading-face': '🥺',
  'grinning-face-with-smiling-eyes': '😁',
};

interface ActiveChatViewProps {
  onLeave: () => void;
  onOpenReport: () => void;
}

export const ActiveChatView: React.FC<ActiveChatViewProps> = ({ onLeave, onOpenReport }) => {
  const {
    currentPartner,
    matchStatus,
    chatMode,
    messages,
    sendMessage,
    sendVoiceMessage,
    isPartnerTyping,
    skipMatch,
    disconnectMatch,
    activeGame,
    startInteractiveGame,
    sendCopilotPrompt,
    connectionStatus,
    sendConnectionRequest,
    blockPartner,
    userProfile,
  } = useSocialDiscovery();

  const [inputVal, setInputVal] = useState('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [useVirtualCam, setUseVirtualCam] = useState(false);
  const [cameraHasHardware, setCameraHasHardware] = useState(true);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [partnerSpeaking, setPartnerSpeaking] = useState(false);
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [currentlyPlayingAudio, setCurrentlyPlayingAudio] = useState<string | null>(null);
  const [gamesMenuOpen, setGamesMenuOpen] = useState(false);
  const [copilotMenuOpen, setCopilotMenuOpen] = useState(false);
  const [safetyMenuOpen, setSafetyMenuOpen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const activeAudioElementRef = useRef<HTMLAudioElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isPartnerTyping, isRecordingVoice]);
  useEffect(() => {
    setPartnerSpeaking(isPartnerTyping);
  }, [isPartnerTyping]);
  useEffect(() => {
    if (chatMode !== 'video' || useVirtualCam) {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      return;
    }

    let isMounted = true;

    async function initMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: 'user' },
          audio: true,
        });

        if (!isMounted) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;
        setCameraHasHardware(true);

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          localVideoRef.current.play().catch(() => { });
        }
        try {
          const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioContextRef.current = audioCtx;
            const source = audioCtx.createMediaStreamSource(stream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);
            analyserRef.current = analyser;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const checkVolume = () => {
              if (!analyserRef.current || isMicMuted) {
                setMicVolume(0);
              } else {
                analyserRef.current.getByteFrequencyData(dataArray);
                let sum = 0;
                for (let i = 0; i < dataArray.length; i++) {
                  sum += dataArray[i];
                }
                const avg = sum / dataArray.length;
                setMicVolume(Math.min(100, Math.round((avg / 128) * 100)));
              }
              animationFrameRef.current = requestAnimationFrame(checkVolume);
            };
            checkVolume();
          }
        } catch {
        }
      } catch (err) {
        if (!isMounted) return;
        setCameraHasHardware(false);
        setUseVirtualCam(true);
      }
    }

    initMedia();

    return () => {
      isMounted = false;
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close().catch(() => { });
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
    };
  }, [chatMode, useVirtualCam]);
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((track) => {
        track.enabled = !isCameraOff;
      });
    }
  }, [isCameraOff]);
  useEffect(() => {
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !isMicMuted;
      });
    }
    if (isMicMuted) {
      setMicVolume(0);
    }
  }, [isMicMuted]);
  useEffect(() => {
    if (isMicMuted) {
      setMicVolume(0);
    }
  }, [isMicMuted]);
  const startVoiceRecording = async () => {
    try {
      setIsRecordingVoice(true);
      setRecordingDuration(0);
      audioChunksRef.current = [];
      recordTimerRef.current = window.setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
      if (streamRef.current && typeof MediaRecorder !== 'undefined') {
        const recorder = new MediaRecorder(streamRef.current);
        mediaRecorderRef.current = recorder;
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            audioChunksRef.current.push(e.data);
          }
        };
        recorder.start(100);
      }
    } catch {
    }
  };

  const cancelVoiceRecording = () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecordingVoice(false);
    setRecordingDuration(0);
    audioChunksRef.current = [];
  };

  const finishVoiceRecording = async () => {
    if (recordTimerRef.current) clearInterval(recordTimerRef.current);
    const duration = Math.max(1, recordingDuration);

    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== 'inactive' &&
      audioChunksRef.current.length > 0
    ) {
      mediaRecorderRef.current.stop();
      setTimeout(() => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        sendVoiceMessage(blob, duration);
        setIsRecordingVoice(false);
        setRecordingDuration(0);
        audioChunksRef.current = [];
      }, 150);
    } else {
      const blob = await synthesizeVoiceNote(duration);
      sendVoiceMessage(blob, duration);
      setIsRecordingVoice(false);
      setRecordingDuration(0);
    }
  };
  const handlePlayAudio = (id: string, audioUrl: string) => {
    if (currentlyPlayingAudio === id) {
      activeAudioElementRef.current?.pause();
      setCurrentlyPlayingAudio(null);
      return;
    }

    if (activeAudioElementRef.current) {
      activeAudioElementRef.current.pause();
    }

    const audio = new Audio(audioUrl);
    activeAudioElementRef.current = audio;
    setCurrentlyPlayingAudio(id);

    audio.onended = () => {
      setCurrentlyPlayingAudio(null);
    };

    audio.onerror = () => {
      setCurrentlyPlayingAudio(null);
    };

    audio.play().catch(() => {
      setCurrentlyPlayingAudio(null);
    });
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim()) return;
    sendMessage(inputVal);
    setInputVal('');
  };

  const handleDisconnect = () => {
    disconnectMatch();
    onLeave();
  };

  if (matchStatus === 'searching' || (!currentPartner && matchStatus !== 'ended')) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[65vh] text-center p-6 select-none animate-in fade-in">
        <div className="relative w-28 h-28 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-[#6FA8FF]/20 animate-ping" />
          <div className="absolute -inset-4 rounded-full border border-[#6FA8FF]/30 animate-pulse" />
          <div className="relative w-20 h-20 rounded-full glass-surface flex items-center justify-center shadow-xl border border-white/80">
            <Sparkles className="w-10 h-10 text-[#6FA8FF] animate-spin" />
          </div>
        </div>
        <h2 className="font-serif text-3xl sm:text-4xl text-[#1B1B3A] dark:text-white font-medium mb-2">
          Collie is Finding Your Match
        </h2>
        <p className="text-sm text-[#4B4A68] dark:text-slate-300 max-w-md mb-6 leading-relaxed">
          Scanning {chatMode === 'video' ? 'video lounge' : 'text rooms'} for friendly peers with shared passions...
        </p>
        <button
          onClick={onLeave}
          className="px-6 py-2.5 rounded-full text-xs font-semibold glass-pill text-[#1B1B3A] dark:text-white hover:bg-white/60 cursor-pointer"
        >
          Cancel Search & Back to Lounge
        </button>
      </div>
    );
  }

  if (!currentPartner || matchStatus === 'ended') {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center p-6 select-none animate-in fade-in">
        <div className="w-16 h-16 rounded-full glass-surface flex items-center justify-center text-[#6FA8FF] mb-4 shadow-md">
          <Sparkles className="w-8 h-8" />
        </div>
        <h2 className="font-serif text-2xl sm:text-3xl text-[#1B1B3A] dark:text-white mb-2">
          Conversation Ended
        </h2>
        <p className="text-sm text-[#4B4A68] dark:text-slate-400 mb-6">
          Ready for another spontaneous encounter?
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onLeave}
            className="px-5 py-2.5 rounded-full text-xs font-semibold glass-pill text-[#1B1B3A] dark:text-white"
          >
            Back to Lounge
          </button>
          <button
            onClick={skipMatch}
            className="px-6 py-2.5 rounded-full text-xs font-semibold bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-md cursor-pointer"
          >
            Find Next Stranger
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-72px)] w-full flex flex-col max-w-7xl mx-auto px-3 sm:px-6 py-4">
      <div className="relative z-30 flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl glass-surface border border-white/70 dark:border-white/15 shadow-md mb-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={currentPartner.avatarUrl}
              alt={currentPartner.pseudonym}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-white/90 shadow-sm"
            />
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm sm:text-base text-[#1B1B3A] dark:text-white">
                {currentPartner.pseudonym}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#6FA8FF]/20 text-[#6FA8FF]">
                {currentPartner.matchScore}% Match
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-[#4B4A68] dark:text-slate-400 flex-wrap">
              <span>{currentPartner.country}</span>
              {currentPartner.language && (
                <>
                  <span>·</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400 inline-flex items-center gap-1">
                    <span>{getLanguageFlag(currentPartner.language)}</span>
                    <span>{currentPartner.language === 'any' ? 'Global' : currentPartner.language.toUpperCase()}</span>
                  </span>
                </>
              )}
              {currentPartner.sharedInterests.length > 0 && (
                <>
                  <span>·</span>
                  <span className="text-[#6FA8FF] font-medium">
                    Shares {currentPartner.sharedInterests.slice(0, 2).join(', ')}
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-auto flex-wrap">
          <div className="relative">
            <button
              onClick={() => {
                setGamesMenuOpen(!gamesMenuOpen);
                setCopilotMenuOpen(false);
                setSafetyMenuOpen(false);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill cursor-pointer ${activeGame ? 'bg-[#6FA8FF] text-white' : 'text-[#1B1B3A] dark:text-white'
                }`}
            >
              <Gamepad2 className="w-3.5 h-3.5" />
              <span>{activeGame ? 'Active Game' : 'Play Games'}</span>
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {gamesMenuOpen && (
              <div className="absolute right-0 top-10 w-52 p-2 rounded-2xl glass-surface shadow-2xl z-50 flex flex-col gap-1 border border-white/80 animate-in fade-in">
                <button
                  onClick={() => {
                    startInteractiveGame('tictactoe');
                    setGamesMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-sm">⭕</span>
                  <div>
                    <div className="font-semibold text-[#1B1B3A] dark:text-white">Tic-Tac-Toe</div>
                    <div className="text-[10px] text-[#4B4A68] dark:text-slate-400">Turn-based live board</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    startInteractiveGame('trivia');
                    setGamesMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-sm">💡</span>
                  <div>
                    <div className="font-semibold text-[#1B1B3A] dark:text-white">Trivia Arena</div>
                    <div className="text-[10px] text-[#4B4A68] dark:text-slate-400">Multi-choice trivia match</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    startInteractiveGame('wyr');
                    setGamesMenuOpen(false);
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-left hover:bg-white/60 dark:hover:bg-white/10 cursor-pointer"
                >
                  <span className="text-sm">⚡</span>
                  <div>
                    <div className="font-semibold text-[#1B1B3A] dark:text-white">Would You Rather?</div>
                    <div className="text-[10px] text-[#4B4A68] dark:text-slate-400">Compare decisions</div>
                  </div>
                </button>
                {activeGame && (
                  <button
                    onClick={() => {
                      startInteractiveGame(null);
                      setGamesMenuOpen(false);
                    }}
                    className="mt-1 text-xs text-rose-500 font-semibold p-1.5 text-center hover:bg-rose-50 rounded-lg cursor-pointer"
                  >
                    Close Game Board
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => {
                setCopilotMenuOpen(!copilotMenuOpen);
                setGamesMenuOpen(false);
                setSafetyMenuOpen(false);
              }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold glass-pill text-[#6FA8FF] dark:text-[#9fc4ff] cursor-pointer"
              title="Ask Collie Copilot for a conversation icebreaker"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Collie Copilot</span>
            </button>

            {copilotMenuOpen && (
              <div className="absolute right-0 top-10 w-72 p-3 rounded-2xl glass-surface shadow-2xl z-50 flex flex-col gap-2 border border-white/80 animate-in fade-in">
                <div className="flex items-center justify-between pb-1 border-b border-white/40">
                  <span className="text-xs font-bold text-[#1B1B3A] dark:text-white flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" /> Collie's Suggestions
                  </span>
                  <span className="text-[10px] text-[#6FA8FF]">Tap to drop into chat</span>
                </div>
                {COPILOT_ICEBREAKERS.slice(0, 4).map((ib, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      sendCopilotPrompt(ib);
                      setCopilotMenuOpen(false);
                    }}
                    className="p-2 rounded-xl text-left text-xs text-[#1B1B3A] dark:text-slate-200 hover:bg-white/60 dark:hover:bg-white/10 transition-colors leading-relaxed cursor-pointer"
                  >
                    {ib}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={sendConnectionRequest}
            disabled={connectionStatus === 'connected' || connectionStatus === 'sent'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${connectionStatus === 'connected'
                ? 'bg-emerald-500 text-white shadow-xs'
                : connectionStatus === 'sent'
                  ? 'bg-amber-100 text-amber-700 dark:bg-amber-950/60'
                  : 'glass-pill text-[#1B1B3A] dark:text-white'
              }`}
          >
            {connectionStatus === 'connected' ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Connected</span>
              </>
            ) : connectionStatus === 'sent' ? (
              <span>Request Sent...</span>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 text-purple-500" />
                <span>Connect</span>
              </>
            )}
          </button>
          <div className="relative">
            <button
              onClick={() => {
                setSafetyMenuOpen(!safetyMenuOpen);
                setGamesMenuOpen(false);
                setCopilotMenuOpen(false);
              }}
              aria-label="Safety menu"
              className="p-2 rounded-full glass-pill text-[#4B4A68] dark:text-slate-300 hover:text-rose-500 cursor-pointer"
            >
              <ShieldAlert className="w-4 h-4" />
            </button>

            {safetyMenuOpen && (
              <div className="absolute right-0 top-10 w-48 p-2 rounded-2xl glass-surface shadow-2xl z-50 flex flex-col gap-1 border border-white/80 animate-in fade-in">
                <button
                  onClick={() => {
                    setSafetyMenuOpen(false);
                    onOpenReport();
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-left cursor-pointer"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Report Stranger</span>
                </button>
                <button
                  onClick={() => {
                    setSafetyMenuOpen(false);
                    blockPartner('Blocked by user during session');
                  }}
                  className="flex items-center gap-2 p-2 rounded-xl text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left cursor-pointer"
                >
                  <ShieldBan className="w-3.5 h-3.5" />
                  <span>Block Stranger</span>
                </button>
              </div>
            )}
          </div>
          <button
            onClick={skipMatch}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#15152B] text-white hover:bg-[#252542] dark:bg-white dark:text-[#15152B] shadow-sm cursor-pointer"
            title="Disconnect and match with next stranger"
          >
            <SkipForward className="w-3.5 h-3.5 text-[#6FA8FF]" />
            <span>Next Stranger</span>
          </button>
          <button
            onClick={handleDisconnect}
            aria-label="Leave chat"
            className="p-2 rounded-full glass-pill text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
            title="Leave lounge"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-[500px]">
        {chatMode === 'video' && (
          <div className="w-full lg:w-[55%] flex flex-col gap-3">
            <div className="relative flex-1 min-h-[300px] sm:min-h-[360px] rounded-3xl glass-surface border border-white/70 dark:border-white/15 overflow-hidden shadow-xl bg-slate-900 flex items-center justify-center">
              <div className="absolute inset-0 bg-radial from-slate-800 via-slate-900 to-[#0b0b1c] flex items-center justify-center">
                <div className="relative flex flex-col items-center">
                  <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden ring-4 ring-[#6FA8FF]/40 shadow-2xl mb-3">
                    <img
                      src={currentPartner.avatarUrl}
                      alt={currentPartner.pseudonym}
                      className="w-full h-full object-cover filter contrast-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                  <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20 shadow-md">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{currentPartner.pseudonym} ({currentPartner.country})</span>
                    <div className="flex items-end gap-0.5 h-3 ml-1">
                      <span
                        className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-150 ${partnerSpeaking ? 'h-3' : 'h-1'
                          }`}
                      />
                      <span
                        className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-150 ${partnerSpeaking ? 'h-2.5' : 'h-1'
                          }`}
                      />
                      <span
                        className={`w-0.5 rounded-full bg-emerald-400 transition-all duration-150 ${partnerSpeaking ? 'h-3.5' : 'h-1'
                          }`}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute bottom-4 right-4 w-36 sm:w-44 aspect-video rounded-2xl overflow-hidden glass-surface border-2 border-white/80 shadow-2xl bg-black z-20">
                {!isCameraOff ? (
                  !useVirtualCam && cameraHasHardware ? (
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover transform -scale-x-100"
                    />
                  ) : (
                    <div className="relative w-full h-full bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 flex flex-col items-center justify-center p-2">
                      <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-[#6FA8FF] shadow-inner mb-1">
                        <img src={userProfile.avatarUrl} alt="Your avatar" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#6FA8FF]/10 animate-pulse" />
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-white/90 font-medium">
                        <Radio className="w-2.5 h-2.5 text-emerald-400 animate-pulse" />
                        <span>Virtual HD Studio</span>
                      </div>
                    </div>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/95 text-white p-2">
                    <VideoOff className="w-5 h-5 text-rose-400 mb-1" />
                    <span className="text-[10px] font-semibold text-slate-300">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-1.5 left-2 flex items-center gap-1.5 px-1.5 py-0.5 rounded-full bg-black/60 backdrop-blur-xs text-[10px] font-semibold text-white">
                  <span>You</span>
                  {!isMicMuted ? (
                    <div className="flex items-end gap-0.5 h-2.5" title={`Voice activity: ${micVolume}%`}>
                      <span
                        className="w-0.5 rounded-full bg-emerald-400 transition-all duration-100"
                        style={{ height: `${Math.max(20, Math.min(100, micVolume * 1.2))}%` }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-emerald-400 transition-all duration-100"
                        style={{ height: `${Math.max(20, Math.min(100, micVolume * 0.9))}%` }}
                      />
                      <span
                        className="w-0.5 rounded-full bg-emerald-400 transition-all duration-100"
                        style={{ height: `${Math.max(20, Math.min(100, micVolume * 1.5))}%` }}
                      />
                    </div>
                  ) : (
                    <span className="text-rose-400 text-[9px] font-bold">Muted</span>
                  )}
                </div>
              </div>
              <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 p-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 shadow-xl">
                <button
                  onClick={() => setIsMicMuted(!isMicMuted)}
                  aria-label={isMicMuted ? 'Unmute microphone' : 'Mute microphone'}
                  title={isMicMuted ? 'Click to Unmute Voice' : 'Voice is LIVE - Click to Mute'}
                  className={`p-2.5 rounded-full transition-all cursor-pointer ${isMicMuted
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-emerald-500 text-white shadow-md ring-2 ring-emerald-300/40 hover:bg-emerald-600'
                    }`}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsCameraOff(!isCameraOff)}
                  aria-label={isCameraOff ? 'Turn on camera' : 'Turn off camera'}
                  title={isCameraOff ? 'Click to Turn On Camera' : 'Camera is LIVE - Click to Turn Off'}
                  className={`p-2.5 rounded-full transition-all cursor-pointer ${isCameraOff
                      ? 'bg-rose-500 text-white shadow-md'
                      : 'bg-[#6FA8FF] text-white shadow-md ring-2 ring-[#6FA8FF]/40 hover:bg-[#5b96ee]'
                    }`}
                >
                  {isCameraOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setUseVirtualCam(!useVirtualCam)}
                  aria-label="Toggle camera source"
                  title={useVirtualCam ? 'Switch back to Live Webcam' : 'Switch to Virtual Studio Cam'}
                  className="p-2.5 rounded-full text-white/90 hover:bg-white/20 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div
          className={`flex-1 flex flex-col rounded-3xl glass-surface border border-white/70 dark:border-white/15 p-4 sm:p-5 shadow-xl ${chatMode === 'text' ? 'max-w-4xl mx-auto w-full' : ''
            }`}
        >
          {activeGame === 'tictactoe' && <TicTacToeGame />}
          {activeGame === 'trivia' && <TriviaGame />}
          {activeGame === 'wyr' && <WouldYouRatherGame />}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 min-h-[300px] max-h-[500px]">
            {messages.map((msg) => {
              const isMe = msg.senderId === userProfile.id;
              if (msg.isSystem) {
                return (
                  <div key={msg.id} className="flex justify-center my-2">
                    <span className="px-3.5 py-1.5 rounded-full text-xs font-medium glass-surface text-[#4B4A68] dark:text-slate-300 text-center max-w-md shadow-xs border border-white/80">
                      {msg.text}
                    </span>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}
                >
                  {!isMe && (
                    <img
                      src={currentPartner.avatarUrl}
                      alt={msg.senderName}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-white"
                    />
                  )}
                  <div
                    className={`max-w-[78%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-xs ${isMe
                        ? 'bg-[#15152B] text-white rounded-br-xs dark:bg-white dark:text-[#15152B]'
                        : 'glass-surface text-[#1B1B3A] dark:text-white rounded-bl-xs'
                      }`}
                  >
                    {msg.audioUrl ? (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => handlePlayAudio(msg.id, msg.audioUrl!)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer shadow-sm ${isMe
                                ? 'bg-white text-[#15152B] dark:bg-[#15152B] dark:text-white'
                                : 'bg-[#6FA8FF] text-white'
                              }`}
                            aria-label={currentlyPlayingAudio === msg.id ? 'Pause voice note' : 'Play voice note'}
                          >
                            {currentlyPlayingAudio === msg.id ? (
                              <Pause className="w-4 h-4 fill-current" />
                            ) : (
                              <Play className="w-4 h-4 fill-current ml-0.5" />
                            )}
                          </button>
                          <div className="flex items-center gap-1 h-6">
                            {[40, 70, 30, 90, 60, 80, 45, 95, 50, 75].map((h, i) => (
                              <span
                                key={i}
                                className={`w-1 rounded-full transition-all duration-200 ${currentlyPlayingAudio === msg.id
                                    ? 'bg-[#6FA8FF] animate-pulse'
                                    : isMe
                                      ? 'bg-white/40 dark:bg-black/30'
                                      : 'bg-slate-400 dark:bg-slate-500'
                                  }`}
                                style={{ height: `${h}%` }}
                              />
                            ))}
                          </div>

                          <span className="text-xs font-semibold">
                            0:{(msg.audioDuration || 3) < 10 ? '0' : ''}{msg.audioDuration || 3}
                          </span>
                        </div>
                        <div className="text-[11px] opacity-80 flex items-center gap-1">
                          <Volume2 className="w-3 h-3" />
                          <span>Voice note</span>
                        </div>
                      </div>
                    ) : (
                      <p>{msg.text}</p>
                    )}

                    <div
                      className={`text-[10px] mt-1 ${isMe ? 'text-white/60 dark:text-[#15152B]/60 text-right' : 'text-[#4B4A68] dark:text-slate-400'
                        }`}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
            {isPartnerTyping && (
              <div className="flex items-center gap-2 text-xs text-[#4B4A68] dark:text-slate-400 pl-9">
                <span className="flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8FF] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8FF] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#6FA8FF] animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
                <span>{currentPartner.pseudonym} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="flex items-center justify-between pt-2.5 pb-1 border-t border-white/40 dark:border-white/10">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-semibold text-[#4B4A68] dark:text-slate-400 uppercase tracking-wider">
                React:
              </span>
              <EmojiReaction
                size="sm"
                align="left"
                onReact={(name) => {
                  const emojiChar = EMOJI_MAP[name] || '✨';
                  sendMessage(emojiChar);
                }}
              />
            </div>
          </div>
          {isRecordingVoice ? (
            <div className="flex items-center justify-between gap-3 p-2.5 rounded-full bg-rose-500/10 border border-rose-500/30 dark:bg-rose-950/20 animate-in fade-in">
              <div className="flex items-center gap-2.5 pl-3">
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500" />
                </span>
                <span className="text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  REC
                </span>
                <span className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-200">
                  0:{recordingDuration < 10 ? '0' : ''}{recordingDuration}
                </span>
                <div className="flex items-center gap-0.5 h-4 ml-2">
                  {[3, 6, 9, 12, 16, 10, 7, 14, 8, 4].map((h, i) => (
                    <span
                      key={i}
                      className="w-0.5 rounded-full bg-rose-500 animate-pulse"
                      style={{
                        height: `${h}px`,
                        animationDuration: `${400 + i * 80}ms`,
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 pr-1">
                <button
                  type="button"
                  onClick={cancelVoiceRecording}
                  className="p-2 rounded-full hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors cursor-pointer"
                  title="Discard voice note"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={finishVoiceRecording}
                  className="px-4 py-1.5 rounded-full bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Voice</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSend} className="relative flex items-center gap-2 pt-2">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder={`Message ${currentPartner.pseudonym}...`}
                className="flex-1 py-3 px-4 rounded-full glass-surface text-sm text-[#1B1B3A] dark:text-white placeholder:text-[#4B4A68]/60 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#6FA8FF]"
                maxLength={500}
              />
              <button
                type="button"
                onClick={startVoiceRecording}
                className="p-3 rounded-full glass-pill hover:bg-[#6FA8FF]/20 text-[#1B1B3A] dark:text-white transition-all cursor-pointer"
                title="Record voice note"
                aria-label="Record voice note"
              >
                <Mic className="w-4 h-4 text-[#6FA8FF]" />
              </button>

              <button
                type="submit"
                disabled={!inputVal.trim()}
                className={`p-3 rounded-full flex items-center justify-center transition-all ${inputVal.trim()
                    ? 'bg-[#15152B] text-white dark:bg-white dark:text-[#15152B] shadow-md hover:scale-105 cursor-pointer'
                    : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};