import { Platform } from 'react-native';
import { UserProfile } from '../types';

// Android emulator maps localhost to 10.0.2.2; physical devices use the machine's local IP
const BASE_URL = Platform.select({
  android: 'http://10.0.2.2:8080',
  ios: 'http://localhost:8080',
  default: 'http://localhost:8080'
});

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

class BiteLensApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/healthz`, { method: 'GET' });
      return res.ok;
    } catch (e) {
      return false;
    }
  }

  async signup(params: { name: string; email: string; password: string; birth_date: string }): Promise<ApiResponse<UserProfile>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Signup failed' };
      }
      return { success: true, data: json.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network request failed' };
    }
  }

  async login(params: { email: string; password: string }): Promise<ApiResponse<UserProfile>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Login failed' };
      }
      return { success: true, data: json.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network request failed' };
    }
  }

  async submitParentalConsent(params: { parent_email: string; consent_token: string }): Promise<ApiResponse> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/auth/parental-consent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(params)
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Parental consent failed' };
      }
      return { success: true, data: json };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network request failed' };
    }
  }

  async getProfile(): Promise<ApiResponse<UserProfile>> {
    try {
      const res = await fetch(`${this.baseUrl}/api/v1/user/profile`, {
        method: 'GET',
        credentials: 'include'
      });
      const json = await res.json();
      if (!res.ok) {
        return { success: false, error: json.error || 'Failed to fetch profile' };
      }
      return { success: true, data: json.user };
    } catch (e: any) {
      return { success: false, error: e.message || 'Network request failed' };
    }
  }
}

export const apiClient = new BiteLensApiClient();
