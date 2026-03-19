import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserDto } from '@erp-rh/shared-types';

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: UserDto | null;
  isAuthenticated: boolean;
  setTokens: (token: string, refreshToken: string) => void;
  setUser: (user: UserDto) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      isAuthenticated: false,
      setTokens: (token, refreshToken) =>
        set({ token, refreshToken, isAuthenticated: true }),
      setUser: (user) => set({ user }),
      logout: () =>
        set({ token: null, refreshToken: null, user: null, isAuthenticated: false }),
    }),
    {
      name: 'erp-rh-auth',
      partialize: (state) => ({
        token: state.token,
        refreshToken: state.refreshToken,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
