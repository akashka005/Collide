import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import {
  UserProfile,
  MatchPartner,
  ChatMessage,
  ChatMode,
  MatchAlgorithm,
  MatchStatus,
  TicTacToeState,
  MutualConnection,
  SafetyReport,
  BlockRecord,
  AuthUser,
} from '../types';
import { checkTicTacToeWinner, TRIVIA_BANK, WOULD_YOU_RATHER_BANK } from '../lib/games';
import { api, WS_BASE_URL, API_BASE_URL } from '../lib/api';

interface SocialDiscoveryContextType {
  userProfile: UserProfile;
  authUser: AuthUser | null;
  matchStatus: MatchStatus;
  currentPartner: MatchPartner | null;
  chatMode: ChatMode;
  matchAlgorithm: MatchAlgorithm;
  messages: ChatMessage[];
  isPartnerTyping: boolean;
  activeGame: 'tictactoe' | 'trivia' | 'wyr' | null;
  ticTacToeState: TicTacToeState;
  currentTriviaIndex: number;
  triviaUserAnswer: number | null;
  triviaPartnerAnswer: number | null;
  triviaScores: { user: number; partner: number };
  currentWyrIndex: number;
  wyrUserChoice: 'A' | 'B' | null;
  wyrPartnerChoice: 'A' | 'B' | null;
  connectionStatus: 'none' | 'sent' | 'received' | 'connected';
  savedConnections: MutualConnection[];
  blockedUsers: BlockRecord[];
  safetyReports: SafetyReport[];
  // Actions
  startSearching: (mode?: ChatMode, algorithm?: MatchAlgorithm) => void;
  cancelSearching: () => void;
  skipMatch: () => void;
  disconnectMatch: () => void;
  sendMessage: (text: string) => void;
  sendVoiceMessage: (audioBlob: Blob, durationSeconds: number) => void;
  sendCopilotPrompt: (prompt: string) => void;
  startInteractiveGame: (game: 'tictactoe' | 'trivia' | 'wyr' | null) => void;
  playTicTacToeMove: (cellIndex: number) => void;
  resetTicTacToe: () => void;
  answerTrivia: (optionIndex: number) => void;
  nextTriviaQuestion: () => void;
  answerWyr: (choice: 'A' | 'B') => void;
  nextWyrPrompt: () => void;
  sendConnectionRequest: () => void;
  acceptConnectionRequest: () => void;
  removeConnection: (connectionId: string) => void;
  clearAllConnections: () => void;
  reportPartner: (category: SafetyReport['category'], notes: string) => void;
  blockPartner: (reason?: string) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  // Auth methods
  loginWithGoogle: (email?: string, name?: string) => Promise<void>;
  loginWithEmail: (email: string, password?: string) => Promise<void>;
  signupWithEmail: (email: string, password: string, name: string, avatarUrl?: string) => Promise<void>;
  loginAsGuest: (name?: string, avatarUrl?: string) => void;
  logout: () => void;
}

const SocialDiscoveryContext = createContext<SocialDiscoveryContextType | undefined>(undefined);

const getInitialUserId = (): string => {
  try {
    const saved = localStorage.getItem('collide_user_id');
    if (saved) return saved;
    const newId = `usr-${Math.random().toString(36).substring(2, 10)}`;
    localStorage.setItem('collide_user_id', newId);
    return newId;
  } catch {
    return `usr-${Date.now()}`;
  }
};

const INITIAL_USER: UserProfile = {
  id: getInitialUserId(),
  pseudonym: 'CosmicWanderer',
  avatarUrl: '/assets/landing/avatar-3.webp',
  ageVerified: true,
  interests: ['Tech & AI', 'Gaming', 'Music & Bands', 'Late Night Chill'],
  language: 'en',
  country: 'Earth',
};

const INITIAL_TIC_TAC_TOE: TicTacToeState = {
  board: Array(9).fill(null),
  currentTurn: 'X',
  winner: null,
  mySymbol: 'X',
  scores: { X: 0, O: 0, ties: 0 },
};

export const SocialDiscoveryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const wsRef = useRef<WebSocket | null>(null);

  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('collide_auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState<UserProfile>(() => {
    try {
      const savedAuth = localStorage.getItem('collide_auth_user');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        return {
          ...INITIAL_USER,
          id: parsed.id,
          pseudonym: parsed.name,
          avatarUrl: parsed.avatarUrl,
          email: parsed.email,
          provider: parsed.provider,
        };
      }
      const saved = localStorage.getItem('collide_user_profile');
      return saved ? JSON.parse(saved) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  });

  useEffect(() => {
    if (authUser) {
      setUserProfile((prev) => ({
        ...prev,
        id: authUser.id,
        pseudonym: authUser.name,
        avatarUrl: authUser.avatarUrl,
        email: authUser.email,
        provider: authUser.provider,
      }));
    }
  }, [authUser]);

  const [matchStatus, setMatchStatus] = useState<MatchStatus>('idle');
  const [currentPartner, setCurrentPartner] = useState<MatchPartner | null>(null);
  const [chatMode, setChatMode] = useState<ChatMode>('video');
  const [matchAlgorithm, setMatchAlgorithm] = useState<MatchAlgorithm>('smart');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPartnerTyping, setIsPartnerTyping] = useState(false);

  // Games
  const [activeGame, setActiveGame] = useState<'tictactoe' | 'trivia' | 'wyr' | null>(null);
  const [ticTacToeState, setTicTacToeState] = useState<TicTacToeState>(INITIAL_TIC_TAC_TOE);
  const [currentTriviaIndex, setCurrentTriviaIndex] = useState(0);
  const [triviaUserAnswer, setTriviaUserAnswer] = useState<number | null>(null);
  const [triviaPartnerAnswer, setTriviaPartnerAnswer] = useState<number | null>(null);
  const [triviaScores, setTriviaScores] = useState({ user: 0, partner: 0 });

  const [currentWyrIndex, setCurrentWyrIndex] = useState(0);
  const [wyrUserChoice, setWyrUserChoice] = useState<'A' | 'B' | null>(null);
  const [wyrPartnerChoice, setWyrPartnerChoice] = useState<'A' | 'B' | null>(null);

  // Social Connections & Safety
  const [connectionStatus, setConnectionStatus] = useState<'none' | 'sent' | 'received' | 'connected'>('none');
  const [savedConnections, setSavedConnections] = useState<MutualConnection[]>(() => {
    try {
      const saved = localStorage.getItem('collide_connections');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      // Cleanse any legacy mock connection artifacts (Liam O., mock-*, peer-*)
      const sanitized = parsed.filter(
        (c: MutualConnection) =>
          c &&
          c.partnerName !== 'Liam O.' &&
          !c.partnerCountry?.includes('Dublin') &&
          !c.id?.startsWith('mock') &&
          !c.partnerId?.startsWith('peer-') &&
          c.partnerName !== 'Kenji T.' &&
          c.partnerName !== 'Maya S.' &&
          c.partnerName !== 'Elena M.'
      );
      if (sanitized.length !== parsed.length) {
        localStorage.setItem('collide_connections', JSON.stringify(sanitized));
      }
      return sanitized;
    } catch {
      return [];
    }
  });

  const [blockedUsers, setBlockedUsers] = useState<BlockRecord[]>(() => {
    try {
      const saved = localStorage.getItem('collide_blocked');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const sanitized = parsed.filter(
        (b: BlockRecord) =>
          b &&
          !b.blockedUserId?.startsWith('peer-') &&
          !b.blockedUserId?.startsWith('mock') &&
          b.blockedUserName !== 'Kenji T.' &&
          b.blockedUserName !== 'Liam O.'
      );
      return sanitized;
    } catch {
      return [];
    }
  });

  const [safetyReports, setSafetyReports] = useState<SafetyReport[]>(() => {
    try {
      const saved = localStorage.getItem('collide_reports');
      if (!saved) return [];
      const parsed = JSON.parse(saved);
      if (!Array.isArray(parsed)) return [];
      const sanitized = parsed.filter(
        (r: SafetyReport) =>
          r &&
          !r.reportedUserId?.startsWith('peer-') &&
          !r.reportedUserId?.startsWith('mock') &&
          r.reportedUserName !== 'Kenji T.' &&
          r.reportedUserName !== 'Liam O.'
      );
      return sanitized;
    } catch {
      return [];
    }
  });

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('collide_user_profile', JSON.stringify(userProfile));
    } catch { }
  }, [userProfile]);

  useEffect(() => {
    try {
      localStorage.setItem('collide_connections', JSON.stringify(savedConnections));
    } catch { }
  }, [savedConnections]);

  useEffect(() => {
    try {
      localStorage.setItem('collide_blocked', JSON.stringify(blockedUsers));
    } catch { }
  }, [blockedUsers]);

  useEffect(() => {
    try {
      localStorage.setItem('collide_reports', JSON.stringify(safetyReports));
    } catch { }
  }, [safetyReports]);
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connectWs = () => {
      try {
        const url = `${WS_BASE_URL}/api/v1/realtime?userId=${encodeURIComponent(userProfile.id)}`;
        ws = new WebSocket(url);
        wsRef.current = ws;

        ws.onopen = () => {
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            const { event: evt, payload } = data;

            if (evt === 'match.found') {
              const partner: MatchPartner = payload.partner;
              setCurrentPartner(partner);
              setMatchStatus('connected');
              const welcomeMsg: ChatMessage = {
                id: `sys-${Date.now()}`,
                senderId: 'system',
                senderName: 'Collide System',
                text: `Connected with ${partner.pseudonym} from ${partner.country}! You both share: ${partner.sharedInterests.length > 0
                    ? partner.sharedInterests.join(', ')
                    : 'a curiosity for new conversations'
                  }. Say hi!`,
                timestamp: Date.now(),
                isSystem: true,
              };
              setMessages([welcomeMsg]);
            } else if (evt === 'queue.joined') {
              setMatchStatus('searching');
            } else if (evt === 'queue.cancelled') {
              setMatchStatus('idle');
            } else if (evt === 'queue.error') {
              setMatchStatus('idle');
              if (payload.reason === 'age_verification_required') {
                localStorage.removeItem('collide_age_verified');
              }
            } else if (evt === 'chat.message') {
              setMessages((prev) => [...prev, payload]);
            } else if (evt === 'chat.typing') {
              setIsPartnerTyping(Boolean(payload.isTyping));
            } else if (evt === 'chat.reaction') {
              const emojiChar = payload.emojiName || '✨';
              const reactionMsg: ChatMessage = {
                id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                senderId: payload.userId,
                senderName: currentPartner?.pseudonym || 'Stranger',
                text: emojiChar,
                timestamp: Date.now(),
              };
              setMessages((prev) => [...prev, reactionMsg]);
            } else if (evt === 'game.start') {
              setActiveGame(payload.game);
              if (payload.state && payload.game === 'tictactoe') {
                setTicTacToeState({
                  board: payload.state.board || Array(9).fill(null),
                  currentTurn: payload.state.currentTurn || 'X',
                  winner: payload.state.winner,
                  mySymbol: 'O',
                  scores: payload.state.scores || { X: 0, O: 0, ties: 0 },
                });
              }
            } else if (evt === 'game.tictactoe.sync') {
              setTicTacToeState((prev) => ({
                ...prev,
                board: payload.board,
                currentTurn: payload.currentTurn,
                winner: payload.winner,
                scores: payload.scores || prev.scores,
              }));
            } else if (evt === 'game.trivia.answer') {
              setTriviaPartnerAnswer(payload.optionIndex);
            } else if (evt === 'game.wyr.vote') {
              setWyrPartnerChoice(payload.choice);
            } else if (evt === 'connection.request') {
              setConnectionStatus('received');
            } else if (evt === 'connection.accept') {
              setConnectionStatus('connected');
              if (currentPartner) {
                const newConnection: MutualConnection = {
                  id: `conn-${Date.now()}`,
                  partnerId: currentPartner.id,
                  partnerName: currentPartner.pseudonym,
                  partnerAvatar: currentPartner.avatarUrl,
                  partnerCountry: currentPartner.country,
                  sharedInterests: currentPartner.sharedInterests,
                  connectedAt: Date.now(),
                };
                setSavedConnections((prev) => [newConnection, ...prev.filter((c) => c.partnerId !== currentPartner.id)]);
              }
            } else if (evt === 'match.ended') {
              setMatchStatus('ended');
              setCurrentPartner(null);
              setActiveGame(null);
            }
          } catch {
          }
        };

        ws.onclose = () => {
          wsRef.current = null;
          reconnectTimeout = setTimeout(connectWs, 3000);
        };

        ws.onerror = () => {
          ws?.close();
        };
      } catch {
      }
    };

    connectWs();

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (ws) {
        ws.onclose = null;
        ws.close();
      }
      wsRef.current = null;
    };
  }, [userProfile.id, currentPartner]);
  const startSearching = useCallback(
    (mode?: ChatMode, algorithm?: MatchAlgorithm) => {
      const targetMode = mode || chatMode;
      const targetAlgorithm = algorithm || matchAlgorithm;
      setChatMode(targetMode);
      setMatchAlgorithm(targetAlgorithm);
      setMatchStatus('searching');
      setCurrentPartner(null);
      setMessages([]);
      setActiveGame(null);
      setConnectionStatus('none');

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'queue.join',
            payload: {
              mode: targetMode,
              algorithm: targetAlgorithm,
              ageVerified: localStorage.getItem('collide_age_verified') === 'true',
              profile: {
                pseudonym: userProfile.pseudonym,
                avatarUrl: userProfile.avatarUrl,
                interests: userProfile.interests,
                language: userProfile.language,
                country: userProfile.country,
              },
            },
          })
        );
      }
    },
    [chatMode, matchAlgorithm, userProfile]
  );

  const cancelSearching = useCallback(() => {
    setMatchStatus('idle');
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'queue.cancel' }));
    }
  }, []);

  const skipMatch = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(
        JSON.stringify({
          event: 'match.skip',
          payload: {
            requeue: true,
            mode: chatMode,
            algorithm: matchAlgorithm,
            profile: {
              pseudonym: userProfile.pseudonym,
              avatarUrl: userProfile.avatarUrl,
              interests: userProfile.interests,
              language: userProfile.language,
              country: userProfile.country,
            },
          },
        })
      );
    }
    setMatchStatus('searching');
    setCurrentPartner(null);
    setMessages([]);
    setActiveGame(null);
  }, [chatMode, matchAlgorithm, userProfile]);

  const disconnectMatch = useCallback(() => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'match.disconnect' }));
    }
    setMatchStatus('ended');
    setCurrentPartner(null);
    setActiveGame(null);
  }, []);
  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || !currentPartner) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        senderId: userProfile.id,
        senderName: userProfile.pseudonym,
        text: text.trim(),
        timestamp: Date.now(),
      };

      setMessages((prev) => [...prev, userMsg]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'chat.message',
            payload: userMsg,
          })
        );
      }
    },
    [currentPartner, userProfile]
  );
  const sendVoiceMessage = useCallback(
    async (audioBlob: Blob, durationSeconds: number) => {
      if (!currentPartner) return;
      const localAudioUrl = URL.createObjectURL(audioBlob);
      const userMsg: ChatMessage = {
        id: `voice-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        senderId: userProfile.id,
        senderName: userProfile.pseudonym,
        text: '🎙️ Voice note',
        timestamp: Date.now(),
        audioUrl: localAudioUrl,
        audioDuration: Math.max(1, Math.round(durationSeconds)),
      };
      setMessages((prev) => [...prev, userMsg]);

      try {
        const uploadRes = await api.media.uploadVoiceNote(audioBlob);
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(
            JSON.stringify({
              event: 'chat.message',
              payload: {
                ...userMsg,
                audioUrl: uploadRes.audioUrl,
              },
            })
          );
        }
      } catch {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(JSON.stringify({ event: 'chat.message', payload: userMsg }));
        }
      }
    },
    [currentPartner, userProfile]
  );
  const sendCopilotPrompt = useCallback(
    (promptText: string) => {
      if (!currentPartner) return;
      const copilotMsg: ChatMessage = {
        id: `copilot-${Date.now()}`,
        senderId: 'copilot',
        senderName: 'Collie (Copilot)',
        text: `✨ Icebreaker: ${promptText}`,
        timestamp: Date.now(),
        isSystem: true,
      };
      setMessages((prev) => [...prev, copilotMsg]);

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'chat.message',
            payload: copilotMsg,
          })
        );
      }
    },
    [currentPartner]
  );
  const startInteractiveGame = useCallback(
    (game: 'tictactoe' | 'trivia' | 'wyr' | null) => {
      setActiveGame(game);
      if (game === 'tictactoe') {
        setTicTacToeState({
          ...INITIAL_TIC_TAC_TOE,
          board: Array(9).fill(null),
          currentTurn: 'X',
          winner: null,
          mySymbol: 'X',
        });
      } else if (game === 'trivia') {
        setCurrentTriviaIndex(0);
        setTriviaUserAnswer(null);
        setTriviaPartnerAnswer(null);
      } else if (game === 'wyr') {
        setCurrentWyrIndex(0);
        setWyrUserChoice(null);
        setWyrPartnerChoice(null);
      }

      if (game && wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'game.start',
            payload: { game },
          })
        );
      }
    },
    []
  );

  const playTicTacToeMove = useCallback(
    (cellIndex: number) => {
      if (
        !activeGame ||
        activeGame !== 'tictactoe' ||
        ticTacToeState.board[cellIndex] !== null ||
        ticTacToeState.winner !== null ||
        ticTacToeState.currentTurn !== ticTacToeState.mySymbol
      ) {
        return;
      }

      const newBoard = [...ticTacToeState.board];
      newBoard[cellIndex] = ticTacToeState.mySymbol;
      const outcome = checkTicTacToeWinner(newBoard);

      setTicTacToeState((prev) => ({
        ...prev,
        board: newBoard,
        currentTurn: prev.mySymbol === 'X' ? 'O' : 'X',
        winner: outcome,
        scores: outcome
          ? {
            ...prev.scores,
            X: outcome === 'X' ? prev.scores.X + 1 : prev.scores.X,
            O: outcome === 'O' ? prev.scores.O + 1 : prev.scores.O,
            ties: outcome === 'tie' ? prev.scores.ties + 1 : prev.scores.ties,
          }
          : prev.scores,
      }));

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'game.tictactoe.move',
            payload: {
              cellIndex,
              symbol: ticTacToeState.mySymbol,
            },
          })
        );
      }
    },
    [activeGame, ticTacToeState]
  );

  const resetTicTacToe = useCallback(() => {
    setTicTacToeState((prev) => ({
      ...prev,
      board: Array(9).fill(null),
      currentTurn: 'X',
      winner: null,
    }));
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'game.tictactoe.reset' }));
    }
  }, []);
  const answerTrivia = useCallback(
    (optionIndex: number) => {
      setTriviaUserAnswer(optionIndex);
      const question = TRIVIA_BANK[currentTriviaIndex];
      const isUserCorrect = optionIndex === question.correctAnswer;

      setTriviaScores((prev) => ({
        ...prev,
        user: isUserCorrect ? prev.user + 100 : prev.user,
      }));

      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'game.trivia.answer',
            payload: {
              questionId: question.id,
              optionIndex,
            },
          })
        );
      }
    },
    [currentTriviaIndex]
  );

  const nextTriviaQuestion = useCallback(() => {
    setCurrentTriviaIndex((prev) => (prev + 1) % TRIVIA_BANK.length);
    setTriviaUserAnswer(null);
    setTriviaPartnerAnswer(null);
  }, []);
  const answerWyr = useCallback(
    (choice: 'A' | 'B') => {
      setWyrUserChoice(choice);
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            event: 'game.wyr.vote',
            payload: { choice },
          })
        );
      }
    },
    []
  );

  const nextWyrPrompt = useCallback(() => {
    setCurrentWyrIndex((prev) => (prev + 1) % WOULD_YOU_RATHER_BANK.length);
    setWyrUserChoice(null);
    setWyrPartnerChoice(null);
  }, []);

  const sendConnectionRequest = useCallback(() => {
    if (!currentPartner) return;
    setConnectionStatus('sent');

    setMessages((prev) => [
      ...prev,
      {
        id: `sys-conn-${Date.now()}`,
        senderId: 'system',
        senderName: 'System',
        text: `🤝 You sent a mutual connection request to ${currentPartner.pseudonym}.`,
        timestamp: Date.now(),
        isSystem: true,
      },
    ]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'connection.request' }));
    }
  }, [currentPartner]);

  const acceptConnectionRequest = useCallback(async () => {
    if (!currentPartner) return;
    setConnectionStatus('connected');
    const newConnection: MutualConnection = {
      id: `conn-${Date.now()}`,
      partnerId: currentPartner.id,
      partnerName: currentPartner.pseudonym,
      partnerAvatar: currentPartner.avatarUrl,
      partnerCountry: currentPartner.country,
      sharedInterests: currentPartner.sharedInterests,
      connectedAt: Date.now(),
    };
    setSavedConnections((prev) => [newConnection, ...prev.filter((c) => c.partnerId !== currentPartner.id)]);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ event: 'connection.accept' }));
    }

    try {
      await fetch(`${API_BASE_URL}/api/v1/connections/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': userProfile.id },
        body: JSON.stringify(newConnection),
      });
    } catch {
    }
  }, [currentPartner, userProfile.id]);

  const removeConnection = useCallback((connectionId: string) => {
    setSavedConnections((prev) => {
      const updated = prev.filter((c) => c.id !== connectionId);
      try {
        localStorage.setItem('collide_connections', JSON.stringify(updated));
      } catch { }
      return updated;
    });
  }, []);

  const clearAllConnections = useCallback(() => {
    setSavedConnections([]);
    try {
      localStorage.removeItem('collide_connections');
    } catch { }
  }, []);
  const reportPartner = useCallback(
    async (category: SafetyReport['category'], notes: string) => {
      if (!currentPartner) return;
      const report: SafetyReport = {
        id: `rep-${Date.now()}`,
        reportedUserId: currentPartner.id,
        reportedUserName: currentPartner.pseudonym,
        reporterId: userProfile.id,
        category,
        notes,
        timestamp: Date.now(),
        status: 'pending',
      };
      setSafetyReports((prev) => [report, ...prev]);
      setBlockedUsers((prev) => [
        ...prev,
        {
          blockedUserId: currentPartner.id,
          blockedUserName: currentPartner.pseudonym,
          timestamp: Date.now(),
          reason: `Reported: ${category}`,
        },
      ]);

      try {
        await api.safety.submitReport(
          userProfile.id,
          currentPartner.id,
          currentPartner.pseudonym,
          category,
          notes
        );
      } catch {
      }

      disconnectMatch();
    },
    [currentPartner, userProfile, disconnectMatch]
  );

  const blockPartner = useCallback(
    async (reason?: string) => {
      if (!currentPartner) return;
      setBlockedUsers((prev) => [
        ...prev,
        {
          blockedUserId: currentPartner.id,
          blockedUserName: currentPartner.pseudonym,
          timestamp: Date.now(),
          reason: reason || 'Blocked by user',
        },
      ]);

      try {
        await api.safety.blockUser(
          userProfile.id,
          currentPartner.id,
          currentPartner.pseudonym,
          reason
        );
      } catch {
      }

      disconnectMatch();
    },
    [currentPartner, userProfile, disconnectMatch]
  );

  const updateUserProfile = useCallback((updates: Partial<UserProfile>) => {
    setUserProfile((prev) => ({ ...prev, ...updates }));
  }, []);
  const loginWithGoogle = useCallback(async (email?: string, name?: string) => {
    const googleEmail = email || 'akashka688@gmail.com';
    const googleName = name || 'Akash K.';
    try {
      const res = await api.auth.loginWithGoogle(googleEmail, googleName);
      setAuthUser(res.user);
      setUserProfile((prev) => ({
        ...prev,
        id: res.profile.id,
        pseudonym: res.profile.pseudonym,
        avatarUrl: res.profile.avatarUrl,
        email: res.profile.email,
        provider: res.profile.provider,
        interests: res.profile.interests.length > 0 ? res.profile.interests : prev.interests,
      }));
      localStorage.setItem('collide_auth_user', JSON.stringify(res.user));
      localStorage.setItem('collide_auth_token', res.token);
    } catch {
      const user: AuthUser = {
        id: `google-${Date.now()}`,
        name: googleName,
        email: googleEmail,
        avatarUrl: '/assets/landing/avatar-1.webp',
        provider: 'google',
        createdAt: Date.now(),
      };
      setAuthUser(user);
      try {
        localStorage.setItem('collide_auth_user', JSON.stringify(user));
      } catch { }
    }
  }, []);

  const loginWithEmail = useCallback(async (email: string, password?: string) => {
    try {
      const res = await api.auth.loginWithEmail(email, password);
      setAuthUser(res.user);
      setUserProfile((prev) => ({
        ...prev,
        id: res.profile.id,
        pseudonym: res.profile.pseudonym,
        avatarUrl: res.profile.avatarUrl,
        email: res.profile.email,
        provider: res.profile.provider,
      }));
      localStorage.setItem('collide_auth_user', JSON.stringify(res.user));
      localStorage.setItem('collide_auth_token', res.token);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('Invalid') || err.message.includes('exist'))) {
        throw err;
      }
      const user: AuthUser = {
        id: `email-${Date.now()}`,
        name: email.split('@')[0],
        email,
        avatarUrl: '/assets/landing/avatar-2.webp',
        provider: 'email',
        createdAt: Date.now(),
      };
      setAuthUser(user);
      try {
        localStorage.setItem('collide_auth_user', JSON.stringify(user));
      } catch { }
    }
  }, []);

  const signupWithEmail = useCallback(async (email: string, password: string, name: string, avatarUrl?: string) => {
    try {
      const res = await api.auth.signupWithEmail(email, password, name, avatarUrl);
      setAuthUser(res.user);
      setUserProfile((prev) => ({
        ...prev,
        id: res.profile.id,
        pseudonym: res.profile.pseudonym,
        avatarUrl: res.profile.avatarUrl,
        email: res.profile.email,
        provider: res.profile.provider,
      }));
      localStorage.setItem('collide_auth_user', JSON.stringify(res.user));
      localStorage.setItem('collide_auth_token', res.token);
    } catch (err) {
      if (err instanceof Error && (err.message.includes('already exists') || err.message.includes('valid'))) {
        throw err;
      }
      const user: AuthUser = {
        id: `email-${Date.now()}`,
        name: name || email.split('@')[0],
        email,
        avatarUrl: avatarUrl || '/assets/landing/avatar-2.webp',
        provider: 'email',
        createdAt: Date.now(),
      };
      setAuthUser(user);
      try {
        localStorage.setItem('collide_auth_user', JSON.stringify(user));
      } catch { }
    }
  }, []);

  const loginAsGuest = useCallback(async (name?: string, avatarUrl?: string) => {
    const guestName = name || `Guest${Math.floor(1000 + Math.random() * 9000)}`;
    const guestAvatar = avatarUrl || '/assets/landing/avatar-3.webp';
    try {
      const res = await api.auth.loginAsGuest(guestName, guestAvatar);
      setAuthUser(res.user);
      setUserProfile((prev) => ({
        ...prev,
        id: res.profile.id,
        pseudonym: res.profile.pseudonym,
        avatarUrl: res.profile.avatarUrl,
        provider: 'guest',
      }));
      localStorage.setItem('collide_auth_user', JSON.stringify(res.user));
      localStorage.setItem('collide_auth_token', res.token);
    } catch {
      const user: AuthUser = {
        id: `guest-${Date.now()}`,
        name: guestName,
        avatarUrl: guestAvatar,
        provider: 'guest',
        createdAt: Date.now(),
      };
      setAuthUser(user);
      try {
        localStorage.setItem('collide_auth_user', JSON.stringify(user));
      } catch { }
    }
  }, []);

  const logout = useCallback(() => {
    setAuthUser(null);
    setUserProfile(INITIAL_USER);
    try {
      localStorage.removeItem('collide_auth_user');
      localStorage.removeItem('collide_auth_token');
      localStorage.removeItem('collide_user_profile');
    } catch { }
  }, []);

  return (
    <SocialDiscoveryContext.Provider
      value={{
        userProfile,
        authUser,
        matchStatus,
        currentPartner,
        chatMode,
        matchAlgorithm,
        messages,
        isPartnerTyping,
        activeGame,
        ticTacToeState,
        currentTriviaIndex,
        triviaUserAnswer,
        triviaPartnerAnswer,
        triviaScores,
        currentWyrIndex,
        wyrUserChoice,
        wyrPartnerChoice,
        connectionStatus,
        savedConnections,
        blockedUsers,
        safetyReports,
        startSearching,
        cancelSearching,
        skipMatch,
        disconnectMatch,
        sendMessage,
        sendVoiceMessage,
        sendCopilotPrompt,
        startInteractiveGame,
        playTicTacToeMove,
        resetTicTacToe,
        answerTrivia,
        nextTriviaQuestion,
        answerWyr,
        nextWyrPrompt,
        sendConnectionRequest,
        acceptConnectionRequest,
        removeConnection,
        clearAllConnections,
        reportPartner,
        blockPartner,
        updateUserProfile,
        loginWithGoogle,
        loginWithEmail,
        signupWithEmail,
        loginAsGuest,
        logout,
      }}
    >
      {children}
    </SocialDiscoveryContext.Provider>
  );
};

export const useSocialDiscovery = () => {
  const context = useContext(SocialDiscoveryContext);
  if (!context) {
    throw new Error('useSocialDiscovery must be used within a SocialDiscoveryProvider');
  }
  return context;
};