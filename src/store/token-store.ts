import { createStore } from 'zustand/vanilla';
import { persist } from 'zustand/middleware';

interface TokenState {
  accessToken: string | undefined;
  refreshToken: string | undefined;
  expiresAt: number | undefined;
  isAnonymous: boolean;
  setTokens: (
    accessToken: string,
    refreshToken: string | undefined,
    expiresIn: number,
    isAnonymous: boolean
  ) => void;
  clearTokens: () => void;
}

export const useTokenStore = createStore<TokenState>()(
  persist(
    (set) => ({
      accessToken: undefined,
      refreshToken: undefined,
      expiresAt: undefined,
      isAnonymous: false,
      setTokens: (accessToken, refreshToken, expiresIn, isAnonymous) =>
        set({
          accessToken,
          refreshToken,
          expiresAt: Date.now() + expiresIn * 1000, // expiresIn is expected in seconds
          isAnonymous,
        }),
      clearTokens: () =>
        set({
          accessToken: undefined,
          refreshToken: undefined,
          expiresAt: undefined,
          isAnonymous: false,
        }),
    }),
    {
      name: 'token-storage',
    }
  )
);
