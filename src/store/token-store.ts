import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

interface TokenState {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  expiresAt: number | undefined;
  setTokens: (
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number
  ) => void;
  clearTokens: () => void;
}

export const useTokenStore = createStore<TokenState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      setTokens: (accessToken, refreshToken, expiresIn) =>
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000, // expiresIn is expected in seconds
        }),
      clearTokens: () =>
        set({
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: undefined,
        }),
    }),
    {
      name: 'token-storage',
    }
  )
);
