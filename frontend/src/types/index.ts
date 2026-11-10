export type ChatMode = 'text' | 'video';
export type MatchAlgorithm = 'smart' | 'random';
export type MatchStatus = 'idle' | 'searching' | 'connected' | 'ended';

export type AuthProviderType = 'google' | 'email' | 'guest';

export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  avatarUrl: string;
  provider: AuthProviderType;
  createdAt: number;
}

export interface UserProfile {
  id: string;
  pseudonym: string;
  avatarUrl: string;
  ageVerified: boolean;
  interests: string[];
  language: string;
  country: string;
  bio?: string;
  email?: string;
  provider?: AuthProviderType;
}

export interface MatchPartner {
  id: string;
  pseudonym: string;
  avatarUrl: string;
  interests: string[];
  language: string;
  country: string;
  mode: ChatMode;
  matchScore: number;
  sharedInterests: string[];
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: number;
  isSystem?: boolean;
  audioUrl?: string;
  audioDuration?: number;
}

export interface TicTacToeState {
  board: Array<'X' | 'O' | null>;
  currentTurn: 'X' | 'O';
  winner: 'X' | 'O' | 'tie' | null;
  mySymbol: 'X' | 'O';
  scores: { X: number; O: number; ties: number };
}

export interface TriviaQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

export interface WouldYouRatherPrompt {
  id: string;
  optionA: string;
  optionB: string;
  votesA: number;
  votesB: number;
}

export interface MutualConnection {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerAvatar: string;
  partnerCountry: string;
  sharedInterests: string[];
  connectedAt: number;
}

export interface SafetyReport {
  id: string;
  reportedUserId: string;
  reportedUserName: string;
  reporterId: string;
  category: 'harassment' | 'inappropriate' | 'spam' | 'underage' | 'other';
  notes: string;
  timestamp: number;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
}

export interface BlockRecord {
  blockedUserId: string;
  blockedUserName: string;
  timestamp: number;
  reason?: string;
}

export interface ModerationMetrics {
  activeSessions: number;
  queueDepth: number;
  avgDurationSec: number;
  reportRatePercent: number;
  healthStatus: string;
}