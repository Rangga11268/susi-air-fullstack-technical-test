<template>
  <div class="login-page">
    <div class="login-card card">
      <!-- Brand Logo & Header -->
      <div class="brand-section">
        <img
          src="/images/susiair-logo.png"
          alt="Susi Air Logo"
          class="login-logo"
        />
        <h1 class="login-title">Pilot Operations Portal</h1>
        <p class="login-subtitle">
          Flight crew authentication and regulatory flight time tracking
        </p>
      </div>

      <!-- High-Contrast Error Alert Banner -->
      <div
        v-if="errorMessage"
        class="alert-banner"
        role="alert"
        aria-live="assertive"
      >
        <div class="alert-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="alert-content">
          <strong class="alert-heading">Authentication Failed</strong>
          <p class="alert-message">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Login Form -->
      <form class="login-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="username" class="form-label">Pilot Username</label>
          <div class="input-wrapper">
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              autocomplete="username"
              placeholder="e.g. johndoe"
              required
              :disabled="isLoading"
            />
          </div>
        </div>

        <div class="form-group">
          <label for="password" class="form-label">Password</label>
          <div class="input-wrapper">
            <input
              id="password"
              v-model="password"
              :type="showPassword ? 'text' : 'password'"
              class="form-input has-toggle"
              autocomplete="current-password"
              placeholder="Enter password"
              required
              :disabled="isLoading"
            />
            <button
              type="button"
              class="btn-toggle-pw"
              :aria-label="showPassword ? 'Hide password' : 'Show password'"
              :aria-pressed="showPassword"
              @click="showPassword = !showPassword"
            >
              <!-- Eye Off / On SVG -->
              <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
        </div>

        <div class="form-actions">
          <button
            type="submit"
            class="btn-primary btn-submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
          >
            <span v-if="isLoading" class="spinner" aria-hidden="true" />
            <span>{{ isLoading ? 'Authenticating...' : 'Sign In to Portal' }}</span>
          </button>
        </div>

        <!-- Testing Credentials Helper -->
        <div class="credentials-helper">
          <span class="helper-label">Demo Credentials:</span>
          <code>johndoe</code> / <code>susiairtest</code>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();

const username = ref('johndoe');
const password = ref('susiairtest');
const showPassword = ref(false);

const isLoading = computed(() => authStore.isLoading);
const errorMessage = computed(() => authStore.errorMessage);

async function handleSubmit() {
  if (!username.value || !password.value) return;

  const success = await authStore.login(username.value.trim(), password.value);
  if (success) {
    await navigateTo('/');
  }
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px 16px;
  background-color: $color-bg;
}

.login-card {
  width: 100%;
  max-width: 390px;
  background-color: $color-surface;
  border-radius: 16px;
  padding: 32px 24px;
  box-shadow: 0 4px 20px rgba(14, 33, 56, 0.08);
}

.brand-section {
  text-align: center;
  margin-bottom: 24px;

  .login-logo {
    max-width: 170px;
    height: auto;
    margin: 0 auto 16px;
  }

  .login-title {
    font-size: 20px;
    font-weight: 700;
    color: $color-primary-navy;
    line-height: 1.25;
    margin: 0 0 6px;
  }

  .login-subtitle {
    font-size: 12px;
    color: $color-text-secondary;
    line-height: 1.4;
    margin: 0;
  }
}

.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: rgba(230, 55, 87, 0.08);
  border: 1px solid $color-brand-red;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;

  .alert-icon {
    color: $color-brand-red;
    flex-shrink: 0;
    margin-top: 1px;

    svg {
      width: 18px;
      height: 18px;
    }
  }

  .alert-content {
    .alert-heading {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: $color-brand-red;
      line-height: 1.2;
    }

    .alert-message {
      font-size: 11.5px;
      color: $color-text-primary;
      margin-top: 2px;
      line-height: 1.35;
    }
  }
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;

  .form-label {
    font-size: 12px;
    font-weight: 600;
    color: $color-text-primary;
  }
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;

  .form-input {
    width: 100%;
    min-height: $tap-target-min;
    padding: 10px 14px;
    border-radius: $radius-input;
    border: 1.5px solid rgba(14, 33, 56, 0.14);
    background-color: #FFFFFF;
    color: $color-text-primary;
    font-size: 13.5px;
    transition: border-color 0.15s ease, box-shadow 0.15s ease;

    &:focus {
      border-color: $color-chart-accent;
      outline: 2px solid $color-chart-accent;
      outline-offset: 2px;
      box-shadow: 0 0 0 3px rgba(34, 197, 232, 0.25);
    }

    &.has-toggle {
      padding-right: 48px;
    }

    &::placeholder {
      color: $color-text-muted;
    }

    &:disabled {
      background-color: #F8FAFC;
      cursor: not-allowed;
    }
  }

  .btn-toggle-pw {
    position: absolute;
    right: 2px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    color: $color-text-secondary;
    border-radius: 6px;
    transition: color 0.15s ease;

    svg {
      width: 18px;
      height: 18px;
    }

    &:hover {
      color: $color-text-primary;
    }
  }
}

.form-actions {
  margin-top: 8px;

  .btn-submit {
    min-height: 48px;
    font-size: 14.5px;
  }
}

.credentials-helper {
  text-align: center;
  font-size: 11px;
  color: $color-text-secondary;
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px dashed rgba(14, 33, 56, 0.1);

  .helper-label {
    display: block;
    margin-bottom: 4px;
    font-weight: 500;
  }

  code {
    background-color: rgba(14, 33, 56, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    color: $color-primary-navy;
    font-weight: 600;
  }
}
</style>
