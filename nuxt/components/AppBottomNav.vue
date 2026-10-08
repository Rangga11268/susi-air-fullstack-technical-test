<template>
  <nav class="bottom-nav" aria-label="Main Navigation">
    <NuxtLink
      to="/"
      class="nav-item"
      :class="{ active: currentPath === '/' }"
      aria-label="Home"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
      <span class="nav-label">Home</span>
    </NuxtLink>

    <NuxtLink
      to="/schedule"
      class="nav-item"
      :class="{ active: currentPath.startsWith('/schedule') }"
      aria-label="Schedule"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span class="nav-label">Schedule</span>
    </NuxtLink>

    <NuxtLink
      to="/logbook"
      class="nav-item"
      :class="{ active: currentPath.startsWith('/logbook') }"
      aria-label="Logbook"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
        <line x1="8" y1="7" x2="16" y2="7" />
        <line x1="8" y1="11" x2="14" y2="11" />
      </svg>
      <span class="nav-label">Logbook</span>
    </NuxtLink>

    <NuxtLink
      to="/more"
      class="nav-item"
      :class="{ active: currentPath.startsWith('/more') }"
      aria-label="More"
    >
      <svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
      <span class="nav-label">More</span>
    </NuxtLink>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();
const currentPath = computed(() => route.path);
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: $mobile-max-width;
  height: $bottom-nav-height;
  background-color: $color-surface;
  border-top: 1px solid $color-border-standard;
  display: flex;
  align-items: center;
  justify-content: space-around;
  z-index: 50;
  box-shadow: 0 -2px 10px rgba(14, 33, 56, 0.04);
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-width: 60px;
  min-height: $tap-target-min;
  padding: 6px 12px;
  color: $color-text-muted;
  text-decoration: none;
  transition: color 0.15s ease;

  .nav-icon {
    width: 22px;
    height: 22px;
    stroke-linecap: round;
    stroke-linejoin: round;
    transition: stroke 0.15s ease, transform 0.15s ease;
  }

  .nav-label {
    font-size: 11px;
    font-weight: 500;
    margin-top: 3px;
  }

  &.active {
    color: $color-primary-navy;

    .nav-icon {
      stroke: $color-brand-red;
      transform: translateY(-1px);
    }

    .nav-label {
      font-weight: 700;
      color: $color-primary-navy;
    }
  }

  &:hover {
    color: $color-primary-navy;
  }
}
</style>
