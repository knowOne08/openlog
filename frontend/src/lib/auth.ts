// Authentication utility functions for interfacing with the backend API

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupCredentials {
  email: string;
  password: string;
  fullName: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    access_token: string;
    refresh_token: string;
    expires_at: string;
    user: {
      id: string;
      email: string;
      name: string;
      role: string;
      team: string;
      is_active: boolean;
      must_change_password: boolean;
      created_at: string;
    };
  };
  error?: {
    code: string;
    message: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
  team: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
}

// Store tokens in localStorage (in production, consider using httpOnly cookies)
const TOKEN_KEY = "surfe_access_token";
const REFRESH_TOKEN_KEY = "surfe_refresh_token";

export const auth = {
  // Login user
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Store tokens
        localStorage.setItem(TOKEN_KEY, data.data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh_token);
      }

      return data;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Login error:", error);
      }
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Network error occurred. Please try again.",
        },
      };
    }
  },

  // Sign up user
  async signup(credentials: SignupCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (data.success && data.data && data.data.session) {
        // Store tokens if auto-login was successful
        localStorage.setItem(TOKEN_KEY, data.data.session.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.data.session.refresh_token);
      }

      return data;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Signup error:", error);
      }
      return {
        success: false,
        error: {
          code: "NETWORK_ERROR",
          message: "Network error occurred. Please try again.",
        },
      };
    }
  },

  // Logout user
  async logout(): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      if (token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Logout error:", error);
      }
    } finally {
      // Clear tokens regardless of API call success
      this.clearTokens();
    }
    return true;
  },

  // Refresh access token
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (!refreshToken) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        localStorage.setItem(TOKEN_KEY, data.data.access_token);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.data.refresh_token);
        return true;
      }

      return false;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Token refresh error:", error);
      }
      return false;
    }
  },

  // Get current user profile
  async getProfile(): Promise<UserProfile | null> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return null;
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        // Token expired, try to refresh
        const refreshed = await this.refreshToken();
        if (refreshed) {
          return this.getProfile(); // Retry with new token
        }
        return null;
      }

      const data = await response.json();

      if (data.success && data.data) {
        return data.data.user;
      }

      return null;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Get profile error:", error);
      }
      return null;
    }
  },

  // Change password
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<boolean> {
    try {
      const token = this.getAccessToken();
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });

      const data = await response.json();
      return data.success;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Change password error:", error);
      }
      return false;
    }
  },

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!this.getAccessToken();
  },

  // Get access token
  getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  // Get refresh token
  getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  // Clear all tokens
  clearTokens(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  // Check if token is expired
  isTokenExpired(): boolean {
    const token = this.getAccessToken();
    if (!token) return true;

    try {
      // Decode JWT token to check expiration
      const payload = JSON.parse(atob(token.split(".")[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      // Only log detailed errors in development
      if (process.env.NODE_ENV === "development") {
        console.error("Token decode error:", error);
      }
      return true;
    }
  },
};

// API client with automatic token handling
export const apiClient = {
  async request(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const token = auth.getAccessToken();

    if (token) {
      options.headers = {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

    // Handle token expiration
    if (response.status === 401 && token) {
      const refreshed = await auth.refreshToken();
      if (refreshed) {
        // Retry request with new token
        const newToken = auth.getAccessToken();
        if (newToken) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          };
          return fetch(`${API_BASE_URL}${endpoint}`, options);
        }
      }
    }

    return response;
  },

  get: (endpoint: string) => apiClient.request(endpoint),

  post: (endpoint: string, data: Record<string, unknown>) =>
    apiClient.request(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  put: (endpoint: string, data: Record<string, unknown>) =>
    apiClient.request(endpoint, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }),

  delete: (endpoint: string) =>
    apiClient.request(endpoint, {
      method: "DELETE",
    }),
};
