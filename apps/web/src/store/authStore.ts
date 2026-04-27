import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthUser } from '@ideconecta/types';
import { setStoredToken, clearStoredToken } from '@/lib/auth';

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<AuthUser>) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user, token) => {
        setStoredToken(token);
        set({ user, token, isAuthenticated: true });
      },

      clearAuth: () => {
        clearStoredToken();
        set({ user: null, token: null, isAuthenticated: false });
      },

      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: 'ideconecta-auth',
      partialize: (state) => ({ user: state.user, token: state.token }),
    }
  )
);
