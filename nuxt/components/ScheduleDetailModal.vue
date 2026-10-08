<template>
  <div
    v-if="isOpen"
    class="modal-backdrop"
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
    @click.self="closeModal"
    @keydown.esc="closeModal"
  >
    <div class="modal-card card">
      <div class="modal-header">
        <div class="header-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h3 id="modal-title" class="modal-title">Detail page coming soon</h3>
        <p class="modal-subtitle">{{ formattedSelectedDate }}</p>
      </div>

      <div class="modal-body">
        <div v-if="duty" class="duty-summary">
          <div class="summary-row">
            <span class="label">Duty Station / Base:</span>
            <span class="value-badge" :style="{ backgroundColor: duty.base_color }">
              {{ duty.base_name || 'Assigned Base' }}
            </span>
          </div>

          <div class="summary-row">
            <span class="label">Duty Classification:</span>
            <span class="value">{{ duty.duty_type }}</span>
          </div>

          <div class="summary-row">
            <span class="label">Scheduled Sectors:</span>
            <span class="value tabular-nums">{{ duty.count_schedules }} flights</span>
          </div>

          <div class="summary-row">
            <span class="label">Logged Logbooks:</span>
            <span class="value tabular-nums">{{ duty.count_logbooks }} flights</span>
          </div>

          <div class="summary-row">
            <span class="label">Fulfillment Status:</span>
            <span class="value status-text" :class="{ 'status-ok': duty.isCompleted, 'status-pending': !duty.isCompleted }">
              {{ duty.isCompleted ? 'Complete (All logged)' : `${duty.remainingDuties} duties pending` }}
            </span>
          </div>
        </div>

        <div v-else class="empty-duty-summary">
          <p>No active duty flight operations scheduled for this calendar date.</p>
        </div>
      </div>

      <div class="modal-actions">
        <button
          type="button"
          class="btn-primary"
          @click="closeModal"
        >
          Back to Schedule
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue';
import { useScheduleStore } from '~/stores/schedule';

const scheduleStore = useScheduleStore();

const isOpen = computed(() => scheduleStore.isDetailOpen);
const duty = computed(() => scheduleStore.selectedSchedule);
const dateStr = computed(() => scheduleStore.selectedDate);

const formattedSelectedDate = computed(() => {
  if (!dateStr.value) return 'Operational Day Summary';
  try {
    const [year, month, day] = dateStr.value.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${dayNames[date.getUTCDay()]}, ${day} ${monthNames[date.getUTCMonth()]} ${year}`;
  } catch {
    return dateStr.value;
  }
});

function closeModal() {
  scheduleStore.closeDetail();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape' && isOpen.value) {
    closeModal();
  }
}

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('keydown', handleKeyDown);
  }
});

onUnmounted(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('keydown', handleKeyDown);
  }
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.modal-backdrop {
  position: fixed;
  inset: 0;
  background-color: rgba(14, 33, 56, 0.6);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-card {
  width: 100%;
  max-width: 380px;
  background-color: $color-surface;
  border-radius: $radius-card;
  padding: 24px 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
  animation: modalIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes modalIn {
  from {
    opacity: 0;
    transform: scale(0.96) translateY(10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  text-align: center;
  margin-bottom: 20px;

  .header-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background-color: rgba(34, 197, 232, 0.12);
    color: $color-primary-navy;
    margin-bottom: 12px;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  .modal-title {
    font-size: 17px;
    font-weight: 700;
    color: $color-primary-navy;
    margin: 0;
    line-height: 1.25;
  }

  .modal-subtitle {
    font-size: 12px;
    color: $color-text-secondary;
    margin-top: 4px;
  }
}

.modal-body {
  margin-bottom: 20px;

  .duty-summary {
    background-color: #F8FAFC;
    border-radius: 10px;
    padding: 14px;
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .summary-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 12px;

    .label {
      color: $color-text-secondary;
    }

    .value {
      font-weight: 600;
      color: $color-text-primary;
    }

    .value-badge {
      font-size: 11px;
      font-weight: 700;
      color: #FFFFFF;
      padding: 3px 8px;
      border-radius: 4px;
    }

    .status-text {
      &.status-ok {
        color: $color-success;
      }
      &.status-pending {
        color: $color-warning;
      }
    }
  }

  .empty-duty-summary {
    text-align: center;
    padding: 20px 10px;
    color: $color-text-secondary;
    font-size: 13px;
  }
}

.modal-actions {
  display: flex;
  justify-content: center;
}
</style>
