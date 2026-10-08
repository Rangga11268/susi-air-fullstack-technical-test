<template>
  <div class="more-page">
    <header class="page-top-header">
      <h1 class="page-title">Operations & Settings</h1>
      <p class="page-subtitle">Pilot profile, application version, and support</p>
    </header>

    <main class="page-content">
      <!-- Pilot Profile Summary Card -->
      <div class="profile-card card">
        <div class="profile-row">
          <div class="avatar-cell">
            <img
              :src="avatarUrl"
              :alt="pilotName"
              class="avatar-img"
            />
          </div>
          <div class="profile-meta">
            <h2 class="name">{{ pilotName }}</h2>
            <p class="role">{{ pilotRole }}</p>
            <p class="base">{{ pilotBase }}</p>
          </div>
        </div>
      </div>

      <!-- App Info Card -->
      <div class="info-card card">
        <h3 class="info-title">System Information</h3>
        <div class="info-row">
          <span class="label">Application:</span>
          <span class="value">Susi Air Pilot Operations</span>
        </div>
        <div class="info-row">
          <span class="label">Release:</span>
          <span class="value">v1.0.0</span>
        </div>
        <div class="info-row">
          <span class="label">DGCA Compliance:</span>
          <span class="value compliance-tag">Active (CASR 135)</span>
        </div>
        <div class="info-row">
          <span class="label">Operations Contact:</span>
          <span class="value">occ@susiair.com</span>
        </div>
      </div>

      <!-- Sign Out CTA -->
      <div class="logout-wrapper">
        <button
          type="button"
          class="btn-primary btn-logout"
          @click="handleLogout"
        >
          Sign Out of Portal
        </button>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { usePilotStore } from '~/stores/pilot';

const authStore = useAuthStore();
const pilotStore = usePilotStore();

const pilotName = computed(() => {
  const name = pilotStore.profile?.name || authStore.user?.name || 'John Doe';
  return name.startsWith('Capt.') ? name : `Capt. ${name}`;
});

const pilotRole = computed(() => {
  return pilotStore.profile?.role || 'Line Captain - C208B Grand Caravan';
});

const pilotBase = computed(() => {
  return pilotStore.profile?.base ? `Base: ${pilotStore.profile.base}` : 'Base: CJN (Pangandaran)';
});

const avatarUrl = computed(() => {
  return (
    pilotStore.profile?.avatarUrl ||
    authStore.user?.avatarUrl ||
    'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe'
  );
});

function handleLogout() {
  authStore.logout();
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.more-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-top-header {
  background-color: $color-primary-navy;
  color: #FFFFFF;
  padding: 20px 16px 18px;

  .page-title {
    font-size: 18px;
    font-weight: 700;
    margin: 0;
  }

  .page-subtitle {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 3px;
  }
}

.profile-card {
  margin-bottom: 14px;

  .profile-row {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .avatar-cell {
    .avatar-img {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      border: 2px solid rgba(14, 33, 56, 0.1);
      background-color: #F1F5F9;
    }
  }

  .profile-meta {
    .name {
      font-size: 16px;
      font-weight: 700;
      color: $color-primary-navy;
      margin: 0 0 2px 0;
    }

    .role {
      font-size: 12px;
      color: $color-text-secondary;
      margin: 0 0 2px 0;
    }

    .base {
      font-size: 11.5px;
      font-weight: 600;
      color: $color-text-muted;
      margin: 0;
    }
  }
}

.info-card {
  margin-bottom: 24px;
  display: flex;
  flex-direction: column;
  gap: 10px;

  .info-title {
    font-size: 13.5px;
    font-weight: 700;
    color: $color-primary-navy;
    margin: 0 0 4px 0;
    border-bottom: 1px solid rgba(14, 33, 56, 0.06);
    padding-bottom: 6px;
  }

  .info-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 12px;

    .label {
      color: $color-text-secondary;
    }

    .value {
      font-weight: 600;
      color: $color-text-primary;
    }

    .compliance-tag {
      color: $color-success;
    }
  }
}

.logout-wrapper {
  margin-top: 10px;

  .btn-logout {
    background-color: transparent;
    color: $color-brand-red;
    border: 1.5px solid $color-brand-red;

    &:hover {
      background-color: rgba(230, 55, 87, 0.06);
    }
  }
}
</style>
