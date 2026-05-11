import { default as axios } from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export interface User {
  id: number;
  nome: string;
  email: string;
  logo_url?: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  tipo: 'admin' | 'empresa' | 'usuario';
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

export interface LoginRequest {
  email: string;
  senha: string;
}

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
  cpf?: string;
  telefone?: string;
  data_nascimento?: string;
  tipo: 'admin' | 'empresa' | 'usuario';
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User;
}

export interface EmpresaLoginRequest {
  cpf_cnpj: string;
}

class AuthService {
  private api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Interceptador para adicionar token JWT
  private setupInterceptors() {
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token expirado ou inválido
          this.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  constructor() {
    this.setupInterceptors();
  }

  // Login para usuários regulares e admin
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/api/users/login', credentials);
      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  }

  // Login para empresas (usando CPF/CNPJ)
  async loginEmpresa(credentials: EmpresaLoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/api/users/login-empresa', {
        cpf_cnpj: credentials.cpf_cnpj,
      });

      const { token, user } = response.data;

      if (token && user) {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao fazer login',
      };
    }
  }

  // Login para admin (email + senha)
  async loginAdmin(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/api/users/login', credentials);
      const { token, user } = response.data;

      if (token && user) {
        if (user.tipo !== 'admin') {
          return { success: false, message: 'Acesso negado: apenas administradores' };
        }
        localStorage.setItem('auth_token', token);
        localStorage.setItem('user', JSON.stringify(user));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Credenciais inválidas',
      };
    }
  }

  // Registro de usuário
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await this.api.post('/api/users/register', userData);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao registrar usuário',
      };
    }
  }

  // Obter perfil do usuário logado
  async getProfile(): Promise<User | null> {
    try {
      const response = await this.api.get('/api/users/profile');
      return response.data.user;
    } catch (error) {
      return null;
    }
  }

  // Atualizar perfil
  async updateProfile(profileData: Partial<User>): Promise<AuthResponse> {
    try {
      const response = await this.api.put('/api/users/profile', profileData);
      const updatedUser = response.data.user;

      if (updatedUser) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao atualizar perfil',
      };
    }
  }

  // Alterar senha
  async changePassword(data: { senha_atual: string; nova_senha: string }): Promise<AuthResponse> {
    try {
      const response = await this.api.put('/api/users/password', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        message: error.response?.data?.message || 'Erro ao alterar senha',
      };
    }
  }

  // Logout
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
  }

  // Verificar se usuário está autenticado
  isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  // Obter usuário atual
  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  // Verificar se é admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo === 'admin';
  }

  // Verificar se é empresa
  isEmpresa(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo === 'empresa';
  }

  // Verificar se é usuário regular
  isUsuario(): boolean {
    const user = this.getCurrentUser();
    return user?.tipo === 'usuario';
  }
}

export const authService = new AuthService();