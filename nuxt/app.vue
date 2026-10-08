<template>
  <div class="app-shell">
    <NuxtPage />
    <AppBottomNav v-if="showNav" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useAuthStore } from '~/stores/auth';

const route = useRoute();
const authStore = useAuthStore();

onMounted(() => {
  authStore.initAuth();
});

const showNav = computed(() => {
  return route.path !== '/login';
});
</script>
