import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { api } from '@/lib/api';
import type { AuthUser, LoginInput, CreateUserInput } from '@/types';

export function useAuth() {
  const { user, token, isAuthenticated, setAuth, clearAuth } = useAuthStore();
  const navigate = useNavigate();

  const login = useCallback(
    async (input: LoginInput) => {
      const response = await api.post<{ data: { user: AuthUser; token: string } }>('/trpc/auth.login', input);
      const { user: authUser, token: authToken } = response.data.data;
      setAuth(authUser, authToken);
      navigate('/dashboard');
      return authUser;
    },
    [setAuth, navigate]
  );

  const register = useCallback(
    async (input: CreateUserInput) => {
      const response = await api.post<{ data: { user: AuthUser; token: string } }>('/trpc/auth.register', input);
      const { user: authUser, token: authToken } = response.data.data;
      setAuth(authUser, authToken);
      navigate('/dashboard');
      return authUser;
    },
    [setAuth, navigate]
  );

  const logout = useCallback(() => {
    clearAuth();
    navigate('/');
  }, [clearAuth, navigate]);

  const isAdmin = user?.role === 'admin';
  const isBusinessOwner = user?.role === 'business_owner' || user?.role === 'admin';

  return { user, token, isAuthenticated, login, register, logout, isAdmin, isBusinessOwner };
}
