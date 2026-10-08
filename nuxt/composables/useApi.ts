// Centralized API client composable for Susi Air Pilot App
import { useAuthStore } from '~/stores/auth';

export interface ApiErrorResponse {
  success: boolean;
  statusCode: number;
  error: string;
  message: string | string[];
  path?: string;
  timestamp?: string;
}

export function useApi() {
  const config = useRuntimeConfig();
  const apiBase = (config.public?.apiBase as string) || 'http://localhost:3001';

  async function apiFetch<T>(endpoint: string, options: Parameters<typeof $fetch>[1] = {}): Promise<T> {
    const authStore = useAuthStore();
    const token = authStore.token;

    const headers: Record<string, string> = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    try {
      return await $fetch<T>(endpoint, {
        baseURL: apiBase,
        ...options,
        headers,
      });
    } catch (err: any) {
      const status = err?.response?.status || err?.statusCode || 500;
      const data = err?.data as ApiErrorResponse | undefined;

      // Extract user friendly message from standard NestJS error envelope
      let message = 'An unexpected network error occurred.';
      if (data?.message) {
        if (Array.isArray(data.message)) {
          message = data.message.join(', ');
        } else {
          message = data.message;
        }
      } else if (err?.message) {
        message = err.message;
      }

      // Handle unauthenticated session expiry
      if (status === 401 && endpoint !== '/auth/login') {
        authStore.logout();
      }

      throw {
        statusCode: status,
        message,
        data,
      };
    }
  }

  return {
    apiFetch,
    apiBase,
  };
}
