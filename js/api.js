/* ==========================================================================
   BiteLens Web Application - Unified API Client Layer
   Connects to Go (Golang) REST API Backend with Offline Fallback
   ========================================================================== */

const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8081/api/v1'
  : '/api/v1';

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    credentials: 'include', // Enforce HttpOnly Cookie passing
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === 'object' && !(options.body instanceof FormData)) {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(data.error || `HTTP error ${response.status}`);
    }
    return { success: true, data };
  } catch (error) {
    console.warn(`[BiteLens API] Request to ${endpoint} failed:`, error.message);
    return { success: false, error: error.message };
  }
}

// --- Auth Endpoints ---
export const authAPI = {
  async register(userData) {
    return await request('/auth/register', {
      method: 'POST',
      body: userData,
    });
  },

  async login(email, password) {
    return await request('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
  },

  async googleAuth(token) {
    return await request('/auth/google', {
      method: 'POST',
      body: { token },
    });
  },

  async logout() {
    return await request('/auth/logout', {
      method: 'POST',
    });
  },

  async getMe() {
    return await request('/auth/me', {
      method: 'GET',
    });
  },

  async submitParentalConsent(parentalEmail) {
    return await request('/auth/parental-consent', {
      method: 'POST',
      body: { parental_email: parentalEmail },
    });
  },
};

// --- Additives Endpoints ---
export const additivesAPI = {
  async getByCode(code) {
    const encoded = encodeURIComponent(code.trim());
    return await request(`/additives/${encoded}`, {
      method: 'GET',
    });
  },
};

// --- Scan & Telemetry Endpoints ---
export const scanAPI = {
  async uploadScan(productData) {
    return await request('/scan', {
      method: 'POST',
      body: productData,
    });
  },

  async getHistory() {
    return await request('/history', {
      method: 'GET',
    });
  },
};

export default {
  auth: authAPI,
  additives: additivesAPI,
  scan: scanAPI,
};
