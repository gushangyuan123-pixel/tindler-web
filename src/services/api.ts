import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const BASE_URL = 'https://closeai.mba';
const FALLBACK_URL = 'https://close-ai-8rdp.onrender.com';

const TOKEN_KEY = 'tindler_auth_token';
const REFRESH_TOKEN_KEY = 'tindler_refresh_token';

class APIService {
  private client: AxiosInstance;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.client = axios.create({
      baseURL: BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor - add auth token
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - handle 401 and refresh token
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                resolve(this.client(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.refreshSubscribers.forEach((callback) => callback(newToken));
            this.refreshSubscribers = [];
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.client(originalRequest);
          } catch (refreshError) {
            this.clearTokens();
            window.location.href = '/';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Try fallback URL on network error
        if (!error.response && originalRequest.baseURL === BASE_URL) {
          originalRequest.baseURL = FALLBACK_URL;
          return this.client(originalRequest);
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  setTokens(token: string, refreshToken: string) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }

  clearTokens() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      throw new Error('No refresh token');
    }

    const response = await axios.post(`${BASE_URL}/api/auth/refresh`, {
      refreshToken,
    });

    const { token, refreshToken: newRefreshToken } = response.data;
    this.setTokens(token, newRefreshToken);
    return token;
  }

  // Auth endpoints
  async loginWithGoogle(idToken: string) {
    const response = await this.client.post('/api/auth/mobile', {
      provider: 'google',
      idToken,
    });
    return response.data;
  }

  async getCurrentUser() {
    const response = await this.client.get('/api/auth/user');
    return response.data;
  }

  // Profile endpoints
  async getAllProfiles() {
    const response = await this.client.get('/api/tindler/profiles/all');
    return response.data;
  }

  async getSwipeProfiles() {
    const response = await this.client.get('/api/tindler/profiles');
    return response.data;
  }

  async getMyProfile() {
    const response = await this.client.get('/api/tindler/me');
    return response.data;
  }

  async claimProfile(profileId: string) {
    const response = await this.client.post('/api/tindler/profiles/claim', {
      profileId,
    });
    return response.data;
  }

  // Swiping endpoints
  async likeProfile(profileId: string) {
    const response = await this.client.post('/api/tindler/like', {
      profileId,
    });
    return response.data;
  }

  async passProfile(profileId: string) {
    const response = await this.client.post('/api/tindler/pass', {
      profileId,
    });
    return response.data;
  }

  // Matches & Messages
  async getMatches() {
    const response = await this.client.get('/api/tindler/matches');
    return response.data;
  }

  async getMessages(matchId: number) {
    const response = await this.client.get(`/api/tindler/matches/${matchId}/messages`);
    return response.data;
  }

  async sendMessage(matchId: number, content: string) {
    const response = await this.client.post(`/api/tindler/matches/${matchId}/messages`, {
      content,
    });
    return response.data;
  }

  // Stats
  async getStats() {
    const response = await this.client.get('/api/tindler/stats');
    return response.data;
  }
}

export const apiService = new APIService();
export default apiService;
