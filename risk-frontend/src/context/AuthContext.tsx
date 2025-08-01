// src/context/AuthContext.tsx
import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { authService } from '../services/auth.service';
import { User, LoginRequest, SignupRequest, AuthContextType } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

type AuthAction =
  | { type: 'AUTH_START' }
  | { type: 'AUTH_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'AUTH_ERROR'; payload: string }
  | { type: 'AUTH_LOGOUT' }
  | { type: 'CLEAR_ERROR' };

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: false,
  error: null,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'AUTH_ERROR':
      return { ...state, isLoading: false, error: action.payload };
    case 'AUTH_LOGOUT':
      return { ...state, user: null, token: null, error: null };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    const token = authService.getToken();
    const user = authService.getCurrentUser();
    
    if (token && user) {
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token } });
    }
  }, []);

  const login = async (credentials: LoginRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      const response = await authService.login(credentials);
      
      const user: User = {
        id: Math.random().toString(),
        email: response.user.email,
        role: response.user.role as 'user' | 'approver' | 'admin',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem('user', JSON.stringify(user));
      dispatch({ type: 'AUTH_SUCCESS', payload: { user, token: response.token } });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Login failed' });
      throw error;
    }
  };

  const signup = async (data: SignupRequest): Promise<void> => {
    try {
      dispatch({ type: 'AUTH_START' });
      await authService.signup(data);
      await login({ email: data.email, password: data.password });
    } catch (error: any) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message || 'Signup failed' });
      throw error;
    }
  };

  const logout = (): void => {
    authService.logout();
    dispatch({ type: 'AUTH_LOGOUT' });
  };

  const value: AuthContextType = {
    user: state.user,
    token: state.token,
    isLoading: state.isLoading,
    login,
    signup,
    logout,
    isAuthenticated: !!state.token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};