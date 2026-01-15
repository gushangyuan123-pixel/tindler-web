import apiService from './api';
import { APIUser } from './types';

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: APIUser | null;
}

class AuthService {
  // Demo mode - no authentication required
  getDemoUser(): APIUser {
    return {
      id: 'demo-user',
      email: 'demo@tindler.app',
      name: 'Demo User',
    };
  }

  signOut() {
    apiService.clearTokens();
  }
}

export const authService = new AuthService();
export default authService;
