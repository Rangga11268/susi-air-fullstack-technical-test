<template>
  <div class="schedule-page">
    <!-- Schedule App Header -->
    <header class="schedule-header">
      <div class="header-inner">
        <div>
          <h1 class="page-title">Pilot Duty Schedule</h1>
          <p class="page-subtitle">Monthly operational flight roster and base assignments</p>
        </div>
        <span class="today-tag tabular-nums">Ref: {{ todayDate }}</span>
      </div>
    </header>

    <!-- Main Content -->
    <main class="page-content">
      <!-- Error Alert Banner -->
      <div v-if="error" class="error-banner card" role="alert">
        <p class="error-message">{{ error }}</p>
        <button type="button" class="btn-retry" @click="loadSchedule">
          Retry
        </button>
      </div>

      <!-- Monthly Calendar Grid Component -->
      <ScheduleCalendar />

      <!-- Date Tap Detail Placeholder Modal -->
      <ScheduleDetailModal />
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useScheduleStore } from '~/stores/schedule';

const scheduleStore = useScheduleStore();

const todayDate = computed(() => scheduleStore.today);
const error = computed(() => scheduleStore.error);

async function loadSchedule() {
  await scheduleStore.fetchSchedules();
}

onMounted(() => {
  loadSchedule();
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.schedule-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.schedule-header {
  position: relative;
  overflow: hidden;
  color: #FFFFFF;
  padding: 20px 16px 18px;
  box-shadow: 0 6px 20px rgba(10, 23, 39, 0.25);
  border-radius: 0 0 22px 22px;

  background-image:
    linear-gradient(
      160deg,
      rgba(8, 18, 34, 0.82) 0%,
      rgba(14, 33, 56, 0.94) 60%,
      rgba(10, 24, 42, 0.99) 100%
    ),
    url('/images/susiair-hero-bg.jpg');
  background-size: cover;
  background-position: center 55%;

  .header-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 700;
    color: #FFFFFF;
    margin: 0;
    line-height: 1.2;
    letter-spacing: -0.2px;
  }

  .page-subtitle {
    font-size: 11.5px;
    color: rgba(255, 255, 255, 0.68);
    margin-top: 3px;
  }

  .today-tag {
    font-size: 10.5px;
    font-weight: 600;
    background-color: rgba(10, 23, 39, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.14);
    padding: 4px 8px;
    border-radius: $radius-pill;
    white-space: nowrap;
    color: $color-chart-accent;
  }
}

.error-banner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: rgba(230, 55, 87, 0.08);
  border-color: rgba(230, 55, 87, 0.3);
  padding: 12px 14px;
  margin-bottom: 16px;

  .error-message {
    font-size: 12px;
    color: $color-brand-red;
    font-weight: 600;
  }

  .btn-retry {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 44px;
    min-width: 44px;
    padding: 10px 18px;
    border-radius: $radius-pill;
    background-color: $color-brand-red;
    color: #FFFFFF;
    font-size: 12px;
    font-weight: 700;
  }
}
</style>
