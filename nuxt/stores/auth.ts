// Auth store for pilot session management
import { defineStore } from 'pinia';

export interface PilotUser {
  username: string;
  name: string;
  role?: string;
  base?: string;
  totalFlightHours: number;
  today?: string;
  avatarUrl: string;
}

interface LoginResponse {
  accessToken: string;
  pilot: {
    username: string;
    name: string;
    totalFlightHours: number;
    avatarUrl: string;
  };
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null as string | null,
    user: null as PilotUser | null,
    isLoading: false,
    errorMessage: null as string | null,
  }),

  getters: {
    isAuthenticated: (state) => Boolean(state.token),
  },

  actions: {
    initAuth() {
      if (import.meta.client) {
        const storedToken = localStorage.getItem('susiair_token');
        const storedUser = localStorage.getItem('susiair_user');
        if (storedToken) {
          this.token = storedToken;
        }
        if (storedUser) {
          try {
            this.user = JSON.parse(storedUser);
          } catch {
            this.user = null;
          }
        }
      }
    },

    async login(username: string, password: string): Promise<boolean> {
      this.isLoading = true;
      this.errorMessage = null;

      const { apiFetch } = useApi();

      try {
        const response = await apiFetch<LoginResponse>('/auth/login', {
          method: 'POST',
          body: { username, password },
        });

        this.token = response.accessToken;
        this.user = {
          username: response.pilot.username,
          name: response.pilot.name,
          totalFlightHours: response.pilot.totalFlightHours,
          avatarUrl: response.pilot.avatarUrl,
        };

        if (import.meta.client) {
          localStorage.setItem('susiair_token', this.token);
          localStorage.setItem('susiair_user', JSON.stringify(this.user));
        }

        return true;
      } catch (err: any) {
        this.errorMessage =
          err?.message ||
          'Invalid username or password. Please check your pilot credentials.';
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.errorMessage = null;

      if (import.meta.client) {
        localStorage.removeItem('susiair_token');
        localStorage.removeItem('susiair_user');
      }

      navigateTo('/login');
    },

    setUser(user: PilotUser) {
      this.user = user;
      if (import.meta.client) {
        localStorage.setItem('susiair_user', JSON.stringify(user));
      }
    },
  },
});
