import { AuthUser, UserProfile, SafetyReport, BlockRecord } from '../types';

export const API_BASE_URL =
  (import.meta.env?.VITE_API_BASE_URL as string) ||
  (typeof window !== 'undefined' && (window as unknown as { __ENV_API_URL?: string }).__ENV_API_URL) ||
  'http://localhost:8000';

export const WS_BASE_URL = API_BASE_URL.replace(/^http/, 'ws');

export interface AuthApiResponse {
  user: AuthUser;
  profile: UserProfile;
  token: string;
}

async function postJson<T>(endpoint: string, body: Record<string, unknown>, headers: Record<string, string> = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let errorDetail = 'Request failed';
    try {
      const errorJson = await response.json();
      errorDetail = errorJson.detail || errorJson.message || errorDetail;
    } catch {
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  auth: {
    loginAsGuest: async (name?: string, avatarUrl?: string): Promise<AuthApiResponse> => {
      return postJson<AuthApiResponse>('/api/v1/auth/guest', {
        name,
        avatarUrl,
      });
    },

    loginWithGoogle: async (email?: string, name?: string): Promise<AuthApiResponse> => {
      return postJson<AuthApiResponse>('/api/v1/auth/google', {
        email,
        name,
        avatarUrl: '/assets/landing/avatar-1.webp',
      });
    },

    loginWithEmail: async (email: string, password?: string): Promise<AuthApiResponse> => {
      return postJson<AuthApiResponse>('/api/v1/auth/email/login', {
        email,
        password,
      });
    },

    signupWithEmail: async (
      email: string,
      password: string,
      name: string,
      avatarUrl?: string
    ): Promise<AuthApiResponse> => {
      return postJson<AuthApiResponse>('/api/v1/auth/email/signup', {
        email,
        password,
        name,
        avatarUrl,
      });
    },
  },

  safety: {
    submitReport: async (
      userId: string,
      reportedUserId: string,
      reportedUserName: string,
      category: SafetyReport['category'],
      notes: string
    ): Promise<SafetyReport> => {
      return postJson<SafetyReport>(
        '/api/v1/reports',
        { reportedUserId, reportedUserName, category, notes },
        { 'X-User-Id': userId }
      );
    },

    blockUser: async (
      userId: string,
      blockedUserId: string,
      blockedUserName: string,
      reason?: string
    ): Promise<BlockRecord> => {
      return postJson<BlockRecord>(
        '/api/v1/blocks',
        { blockedUserId, blockedUserName, reason },
        { 'X-User-Id': userId }
      );
    },
  },

  media: {
    uploadVoiceNote: async (blob: Blob): Promise<{ audioUrl: string }> => {
      const formData = new FormData();
      formData.append('file', blob, 'voicenote.webm');
      const response = await fetch(`${API_BASE_URL}/api/v1/media/voice-note`, {
        method: 'POST',
        body: formData,
      });
      if (!response.ok) {
        throw new Error('Failed to upload voice note');
      }
      return response.json();
    },
  },
};
