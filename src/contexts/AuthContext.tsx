'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
interface User {
  id: string;
  internalId: number;
  name: string;
  display_name?: string;
  email: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other' | string;
  email_verified_at?: string | null;
  last_login?: string | null;
  address?: string;
  is_admin?: boolean;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  authenticated: boolean;
  emailVerified: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message: string; emailNotVerified?: boolean; user?: User }>;
  register: (userData: RegisterData) => Promise<{ success: boolean; message: string; warning?: string }>;
  logout: () => Promise<void>;
  verifyEmail: (token: string) => Promise<{ success: boolean; message: string }>;
  resendVerification: (email: string) => Promise<{ success: boolean; message: string }>;
  checkAuth: () => Promise<void>;
}
interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone?: string;
  cpf?: string;
  birth_date?: string;
  gender?: 'M' | 'F' | 'Other';
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      if (data.success && data.authenticated) {
        setUser(data.user);
        setAuthenticated(true);
        setEmailVerified(data.emailVerified);
      } else {
        setUser(null);
        setAuthenticated(false);
        setEmailVerified(false);
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setUser(null);
      setAuthenticated(false);
      setEmailVerified(false);
    } finally {
      setLoading(false);
    }
  };
  const login = async (email: string, password: string) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include', 
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUser(data.user);
        setAuthenticated(true);
        setEmailVerified(Boolean(data.user?.email_verified_at) || Boolean(data.user?.emailVerified));
        return { success: true, message: data.message, user: data.user };
      } else {
        const errorMessage = data.message || data.error || 'Erro ao fazer login. Tente novamente.';
        return { 
          success: false, 
          message: errorMessage,
          emailNotVerified: data.emailNotVerified 
        };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor. Verifique sua conexão e tente novamente.' };
    }
  };
  const register = async (userData: RegisterData) => {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      return { 
        success: data.success, 
        message: data.message,
        warning: data.warning 
      };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  };
  const logout = async () => {
    try {
      setUser(null);
      setAuthenticated(false);
      setEmailVerified(false);
      
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include', 
        cache: 'no-store',
      });
      
      setTimeout(() => {
        checkAuth();
      }, 1000);
    } catch (error) {
      console.error('Erro no logout:', error);
      setUser(null);
      setAuthenticated(false);
      setEmailVerified(false);
    }
  };
  const verifyEmail = async (token: string) => {
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
        setAuthenticated(true);
        setEmailVerified(true);
        
        setTimeout(async () => {
          try {
            const meResponse = await fetch('/api/auth/me');
            const meData = await meResponse.json();
            if (meData.success && meData.user) {
              setUser(meData.user);
            }
          } catch (error) {
            console.warn('Erro ao atualizar dados do usuário após verificação:', error);
          }
        }, 500);
      }
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Erro na verificação:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  };
  const resendVerification = async (email: string) => {
    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      return { success: data.success, message: data.message };
    } catch (error) {
      console.error('Erro ao reenviar verificação:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  };
  useEffect(() => {
    checkAuth();
  }, []);
  const value: AuthContextType = {
    user,
    loading,
    authenticated,
    emailVerified,
    login,
    register,
    logout,
    verifyEmail,
    resendVerification,
    checkAuth,
  };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    if (typeof window === 'undefined') {
      return {
        user: null,
        loading: true,
        authenticated: false,
        emailVerified: false,
        login: async () => ({ success: false, message: 'SSR not supported', emailNotVerified: undefined, user: undefined }),
        register: async () => ({ success: false, message: 'SSR not supported', warning: undefined }),
        logout: async () => {},
        verifyEmail: async () => ({ success: false, message: 'SSR not supported' }),
        resendVerification: async () => ({ success: false, message: 'SSR not supported' }),
        checkAuth: async () => {},
      };
    }
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}
