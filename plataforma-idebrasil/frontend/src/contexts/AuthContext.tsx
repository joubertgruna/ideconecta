import React, { createContext, useContext, useReducer, ReactNode, useEffect } from 'react';

// Tipos de usuário
export type UserType = 'usuario' | 'empresa' | 'admin';

export interface User {
  id: number;
  tipo: UserType;
  email?: string;
  nome?: string;
  username?: string;
  telefone?: string;
  logo_url?: string;
  // Campos específicos para empresa
  cpf?: string;
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  // Campos específicos para admin
  role?: string;
  criado_em?: string;
  atualizado_em?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGOUT' }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'UPDATE_PROFILE'; payload: Partial<User> }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('auth_token'),
  isAuthenticated: !!localStorage.getItem('auth_token'),
  loading: false,
  error: null,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('auth_token', action.payload.token);
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      };
    case 'LOGOUT':
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user');
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null,
      };
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'UPDATE_PROFILE':
      if (state.user) {
        const updatedUser = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        return {
          ...state,
          user: updatedUser,
          loading: false,
          error: null,
        };
      }
      return state;
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext<{
  state: AuthState;
  dispatch: React.Dispatch<AuthAction>;
  login: (credentials: any, userType: UserType) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
} | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Carregar dados do usuário do localStorage na inicialização
  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    const userData = localStorage.getItem('user');

    if (token && userData) {
      try {
        const user = JSON.parse(userData);
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } catch (error) {
        // Dados inválidos, fazer logout
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (credentials: any, userType: UserType) => {
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const authService = await import('../services/authService').then(module => module.authService);

      let response: any;

      switch (userType) {
        case 'usuario':
          response = await authService.login(credentials);
          break;
        case 'empresa':
          response = await authService.loginEmpresa(credentials);
          break;
        case 'admin':
          response = await authService.loginAdmin(credentials);
          break;
        default:
          throw new Error('Tipo de usuário inválido');
      }

      if (response.success && response.token && response.user) {
        const { user, token } = response;
        localStorage.setItem('user', JSON.stringify(user));
        dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro no login';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    }
  };

  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  const updateProfile = async (data: Partial<User>) => {
    if (!state.user) {
      dispatch({ type: 'SET_ERROR', payload: 'Usuário não autenticado' });
      return;
    }

    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'CLEAR_ERROR' });

    try {
      const authService = await import('../services/authService').then(module => module.authService);
      const response = await authService.updateProfile(data);

      if (response.success && response.user) {
        dispatch({ type: 'UPDATE_PROFILE', payload: response.user });
      } else {
        throw new Error(response.message || 'Erro ao atualizar perfil');
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Erro ao atualizar perfil';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{
      state,
      dispatch,
      login,
      logout,
      updateProfile,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};