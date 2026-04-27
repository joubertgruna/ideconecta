export type Role = 'admin' | 'business_owner' | 'user';

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export interface User {
  id: string;
  clerkId?: string;
  email: string;
  name: string;
  avatarUrl?: string;
  role: Role;
  permissions: Permission[];
  cpf?: string;
  phone?: string;
  isEmailVerified: boolean;
  isActive: boolean;
  companies?: string[]; // company IDs
  createdAt: string;
  updatedAt: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatarUrl?: string;
}

export interface UserProfile extends User {
  totalCompanies: number;
  totalReviews: number;
}

export interface CreateUserInput {
  email: string;
  name: string;
  password: string;
  cpf?: string;
  phone?: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}
