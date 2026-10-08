// Global route middleware for pilot authentication enforcement
import { useAuthStore } from '~/stores/auth';

export default defineNuxtRouteMiddleware((to) => {
  const authStore = useAuthStore();

  // Hydrate token on client side if not already hydrated
  if (!authStore.token && import.meta.client) {
    authStore.initAuth();
  }

  const isPublicRoute = to.path === '/login';

  if (!authStore.isAuthenticated && !isPublicRoute) {
    return navigateTo('/login');
  }

  if (authStore.isAuthenticated && isPublicRoute) {
    return navigateTo('/');
  }
});
