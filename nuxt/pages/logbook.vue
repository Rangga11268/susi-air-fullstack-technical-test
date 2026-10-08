<template>
  <div class="placeholder-page">
    <header class="page-top-header">
      <h1 class="page-title">Flight Logbook</h1>
      <p class="page-subtitle">Electronic logbook records and flight duty logs</p>
    </header>

    <main class="page-content">
      <div class="coming-soon-card card">
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            <line x1="8" y1="7" x2="16" y2="7" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </div>
        <h2 class="card-heading">Logbook Feature Coming Soon</h2>
        <p class="card-desc">
          Electronic Flight Logbook (eLog) submission and synchronization feature will be enabled in Phase 2.
        </p>
        <NuxtLink to="/" class="btn-primary btn-action">
          Return to Dashboard
        </NuxtLink>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
// Clean placeholder page for secondary navigation
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.placeholder-page {
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

.coming-soon-card {
  text-align: center;
  padding: 32px 20px;
  margin-top: 20px;

  .card-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 52px;
    height: 52px;
    border-radius: 50%;
    background-color: rgba(34, 197, 232, 0.12);
    color: $color-primary-navy;
    margin-bottom: 16px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  .card-heading {
    font-size: 16px;
    font-weight: 700;
    color: $color-primary-navy;
    margin: 0 0 8px 0;
  }

  .card-desc {
    font-size: 12.5px;
    color: $color-text-secondary;
    line-height: 1.45;
    margin: 0 0 20px 0;
  }

  .btn-action {
    max-width: 200px;
    margin: 0 auto;
  }
}
</style>
