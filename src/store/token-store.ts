import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

interface TokenState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  setTokens: (accessToken: string, refreshToken: string | null, expiresIn: number) => void;
  clearTokens: () => void;
}

export const useTokenStore = createStore<TokenState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      setTokens: (accessToken, refreshToken, expiresIn) => set({
        accessToken,
        refreshToken,
        expiresAt: Date.now() + expiresIn * 1000, // expiresIn is expected in seconds
      }),
      clearTokens: () => set({
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
      }),
    }),
    {
      name: 'token-storage',
    }
  )
);