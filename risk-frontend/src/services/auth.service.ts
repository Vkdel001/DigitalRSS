
// src/services/auth.service.ts
import { apiService } from './api';
import { AuthResponse, LoginRequest, SignupRequest, User } from '../types';

export const authService = {
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await apiService.post<AuthResponse>('/auth/login', credentials);
    if (response.token) {
      apiService.setAuthToken(response.token);
    }
    return response;
  },

  async signup(data: SignupRequest): Promise<{ message: string; user: User }> {
    return apiService.post('/auth/signup', data);
  },

  logout(): void {
    apiService.removeAuthToken();
    localStorage.removeItem('user');
  },

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  getToken(): string | null {
    return localStorage.getItem('authToken');
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
