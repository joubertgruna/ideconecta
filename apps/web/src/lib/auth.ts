import type { AuthUser } from '@ideconecta/types';

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
}

export function getStoredToken(): string | null {
  return localStorage.getItem('auth_token');
}

export function setStoredToken(token: string): void {
  localStorage.setItem('auth_token', token);
}

export function clearStoredToken(): void {
  localStorage.removeItem('auth_token');
}

export function decodeToken(token: string): AuthUser | null {
  try {
    const base64 = token.split('.')[1];
    if (!base64) return null;
    const payload = JSON.parse(atob(base64)) as AuthUser & { exp?: number };
    if (payload.exp && payload.exp * 1000 < Date.now()) return null;
    return { id: payload.id, email: payload.email, name: payload.name, role: payload.role };
  } catch {
    return null;
  }
}
