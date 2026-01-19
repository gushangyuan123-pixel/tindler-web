import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Use environment variable for API URL, fallback to localhost for development
const BC_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const BC_TOKEN_KEY = 'bc_auth_token';

class BCAPIService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: BC_API_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Token ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management
  getToken(): string | null {
    return localStorage.getItem(BC_TOKEN_KEY);
  }

  setToken(token: string) {
    localStorage.setItem(BC_TOKEN_KEY, token);
  }

  clearToken() {
    localStorage.removeItem(BC_TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Auth endpoints
  getGoogleLoginUrl(): string {
    return `${BC_API_URL}/accounts/google/login/`;
  }

  async logout() {
    try {
      await this.client.post('/api/auth/logout/');
    } finally {
      this.clearToken();
    }
  }

  // User endpoints
  async getCurrentUser() {
    const response = await this.client.get('/api/me/');
    return response.data;
  }

  async updateUserType(userType: 'applicant' | 'bc_member') {
    const response = await this.client.patch('/api/me/', { user_type: userType });
    return response.data;
  }

  // Photo upload
  async uploadPhoto(file: File): Promise<{ photo_url: string }> {
    const formData = new FormData();
    formData.append('photo', file);

    const response = await this.client.post('/api/upload-photo/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // BC Member Profile endpoints
  async createBCMemberProfile(data: {
    name: string;
    photo_url?: string;
    year: string;
    major: string;
    semesters_in_bc: number;
    areas_of_expertise: string[];
    availability: string;
    bio: string;
    project_experience?: string;
  }) {
    const response = await this.client.post('/api/bc-members/', data);
    return response.data;
  }

  async getMyBCMemberProfile() {
    const response = await this.client.get('/api/bc-members/me/');
    return response.data;
  }

  async updateBCMemberProfile(id: number, data: Partial<{
    name: string;
    photo_url: string;
    year: string;
    major: string;
    semesters_in_bc: number;
    areas_of_expertise: string[];
    availability: string;
    bio: string;
    project_experience: string;
  }>) {
    const response = await this.client.patch(`/api/bc-members/${id}/`, data);
    return response.data;
  }

  // Applicant Profile endpoints
  async createApplicantProfile(data: {
    name: string;
    photo_url?: string;
    role: string;
    why_bc: string;
    relevant_experience: string;
    interests: string[];
  }) {
    const response = await this.client.post('/api/applicants/', data);
    return response.data;
  }

  async getMyApplicantProfile() {
    const response = await this.client.get('/api/applicants/me/');
    return response.data;
  }

  async updateApplicantProfile(id: number, data: Partial<{
    name: string;
    photo_url: string;
    role: string;
    why_bc: string;
    relevant_experience: string;
    interests: string[];
  }>) {
    const response = await this.client.patch(`/api/applicants/${id}/`, data);
    return response.data;
  }

  // Discovery endpoints
  async getDiscoverProfiles() {
    const response = await this.client.get('/api/discover/');
    return response.data;
  }

  // Swiping endpoints
  async swipe(targetId: number, direction: 'like' | 'pass') {
    const response = await this.client.post('/api/swipe/', {
      target_id: targetId,
      direction,
    });
    return response.data;
  }

  // Match endpoints
  async getMatches() {
    const response = await this.client.get('/api/matches/');
    return response.data;
  }

  async getMatch(matchId: number) {
    const response = await this.client.get(`/api/matches/${matchId}/`);
    return response.data;
  }

  // Message endpoints
  async getMessages(matchId: number) {
    const response = await this.client.get(`/api/matches/${matchId}/messages/`);
    return response.data;
  }

  async sendMessage(matchId: number, content: string) {
    const response = await this.client.post(`/api/matches/${matchId}/messages/`, {
      content,
    });
    return response.data;
  }

  async markMessagesAsRead(matchId: number) {
    const response = await this.client.post(`/api/matches/${matchId}/messages/mark-read/`);
    return response.data;
  }

  // Reset profile (logout/switch role)
  async resetProfile() {
    const response = await this.client.post('/api/reset-profile/');
    return response.data;
  }
}

export const bcApiService = new BCAPIService();
export default bcApiService;
