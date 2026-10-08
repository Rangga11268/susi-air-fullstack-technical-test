<template>
  <div class="login-page">
    <!-- Top Aviation Hero Banner -->
    <div class="hero-panel">
      <div class="hero-content">
        <div class="hero-top-row">
          <img
            src="/images/susiairlogo.png"
            alt="Susi Air"
            class="hero-logo"
          />
          <span class="fleet-status">CASR 135 FTL</span>
        </div>

        <div class="hero-tagline">
          <h1 class="hero-text">Pilot Operations Portal</h1>
          <p class="hero-sub">
            Flight time tracking, duty rosters, and regulatory compliance across Indonesia
          </p>
        </div>

        <!-- HD Aircraft Fleet Strip -->
        <div class="aircraft-strip">
          <img
            src="/images/susiair-caravan-hd.jpg"
            alt="Susi Air Cessna C208B Grand Caravan"
            class="aircraft-thumb"
          />
          <div class="aircraft-meta">
            <span class="aircraft-model">Cessna 208B Grand Caravan</span>
            <span class="aircraft-route">Pioneer &amp; Charter Fleet · Base CJN</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Login Form Sheet -->
    <div class="form-panel">
      <div class="form-inner">
        <div class="form-header">
          <h2 class="form-title">Crew Sign In</h2>
          <p class="form-subtitle">Enter your assigned pilot credentials to access duty records</p>
        </div>

        <!-- High-Contrast Error Alert -->
        <div
          v-if="errorMessage"
          class="alert-banner"
          role="alert"
          aria-live="assertive"
        >
          <svg class="alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <div>
            <strong class="alert-heading">Authentication Failed</strong>
            <p class="alert-message">{{ errorMessage }}</p>
          </div>
        </div>

        <!-- Login Form -->
        <form class="login-form" @submit.prevent="handleSubmit">
          <div class="form-group">
            <label for="username" class="form-label">Pilot Username</label>
            <input
              id="username"
              v-model="username"
              type="text"
              class="form-input"
              autocomplete="username"
              placeholder="Enter pilot username"
              required
              :disabled="isLoading"
            />
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
                <svg v-if="showPassword" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                  <line x1="1" y1="1" x2="23" y2="23" />
                </svg>
                <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
          </div>

          <button
            type="submit"
            class="btn-submit"
            :disabled="isLoading"
            :aria-busy="isLoading"
          >
            <span v-if="isLoading" class="spinner" aria-hidden="true" />
            <span>{{ isLoading ? 'Authenticating...' : 'Sign In to Portal' }}</span>
          </button>
        </form>

        <div class="credentials-helper">
          <span class="helper-label">Test Account:</span>
          <code>johndoe</code> / <code>susiairtest</code>
        </div>
      </div>
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
  flex-direction: column;
  background-color: $color-primary-navy;
}

.hero-panel {
  position: relative;
  padding: 28px 20px 36px;
  background-image:
    linear-gradient(
      180deg,
      rgba(8, 18, 34, 0.45) 0%,
      rgba(10, 23, 39, 0.78) 60%,
      rgba(14, 33, 56, 0.96) 100%
    ),
    url('/images/susiair-hero-bg.jpg');
  background-size: cover;
  background-position: center 30%;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.hero-top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.hero-logo {
  height: 32px;
  width: auto;
  object-fit: contain;
}

.fleet-status {
  font-size: 11px;
  font-weight: 700;
  color: $color-chart-accent;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.hero-tagline {
  .hero-text {
    font-size: 24px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.18;
    margin: 0 0 6px;
    letter-spacing: -0.3px;
    text-shadow: 0 2px 10px rgba(0, 0, 0, 0.45);
  }

  .hero-sub {
    font-size: 12.5px;
    color: rgba(255, 255, 255, 0.82);
    line-height: 1.45;
    margin: 0;
  }
}

.aircraft-strip {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 12px;
  background-color: rgba(10, 23, 39, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.14);

  .aircraft-thumb {
    width: 60px;
    height: 44px;
    border-radius: 8px;
    object-fit: cover;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  .aircraft-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;

    .aircraft-model {
      font-size: 12.5px;
      font-weight: 700;
      color: #FFFFFF;
    }

    .aircraft-route {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.7);
    }
  }
}

.form-panel {
  flex: 1;
  background-color: $color-surface;
  border-radius: 24px 24px 0 0;
  margin-top: -14px;
  position: relative;
  z-index: 2;
  padding: 28px 20px 36px;
  box-shadow: 0 -4px 20px rgba(8, 18, 34, 0.2);
}

.form-inner {
  width: 100%;
}

.form-header {
  margin-bottom: 22px;

  .form-title {
    font-size: 20px;
    font-weight: 800;
    color: $color-text-primary;
    margin: 0 0 4px;
    letter-spacing: -0.2px;
  }

  .form-subtitle {
    font-size: 12.5px;
    color: $color-text-secondary;
    margin: 0;
    line-height: 1.45;
  }
}

.alert-banner {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  background-color: rgba(230, 55, 87, 0.08);
  border: 1px solid $color-brand-red;
  border-radius: 8px;
  padding: 12px 14px;
  margin-bottom: 18px;

  .alert-icon {
    color: $color-brand-red;
    flex-shrink: 0;
    width: 18px;
    height: 18px;
    margin-top: 1px;
  }

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
}

.form-input {
  width: 100%;
  min-height: $tap-target-min;
  padding: 10px 14px;
  border-radius: $radius-input;
  border: 1.5px solid rgba(14, 33, 56, 0.16);
  background-color: $color-surface;
  color: $color-text-primary;
  font-size: 13.5px;
  font-family: $font-family-base;
  transition: border-color 0.15s, box-shadow 0.15s;

  &.has-toggle {
    padding-right: 48px;
  }

  &::placeholder {
    color: $color-text-muted;
  }

  &:focus {
    border-color: $color-chart-accent;
    outline: 2px solid $color-chart-accent;
    outline-offset: 2px;
    box-shadow: 0 0 0 3px rgba(34, 197, 232, 0.2);
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
  transition: color 0.15s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    color: $color-text-primary;
  }

  &:focus-visible {
    outline: 2px solid $color-chart-accent;
    outline-offset: 1px;
  }
}

.btn-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  min-height: 48px;
  margin-top: 6px;
  padding: 12px 24px;
  background-color: $color-brand-red;
  color: #FFFFFF;
  font-size: 14px;
  font-weight: 700;
  font-family: $font-family-base;
  border-radius: $radius-pill;
  cursor: pointer;
  transition: background-color 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    background-color: $color-brand-red-hover;
  }

  &:active:not(:disabled) {
    transform: scale(0.99);
  }

  &:focus-visible {
    outline: 2px solid $color-chart-accent;
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
}

.spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #FFFFFF;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.credentials-helper {
  margin-top: 22px;
  padding-top: 14px;
  border-top: 1px dashed rgba(14, 33, 56, 0.12);
  text-align: center;
  font-size: 11.5px;
  color: $color-text-secondary;

  .helper-label {
    font-weight: 500;
    margin-right: 4px;
  }

  code {
    background-color: rgba(14, 33, 56, 0.06);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    font-size: 11px;
    color: $color-text-primary;
    font-weight: 600;
  }
}
</style>
