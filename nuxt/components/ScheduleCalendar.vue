<template>
  <div class="calendar-wrapper card">
    <!-- Month Navigation Controls -->
    <div class="calendar-controls">
      <button
        type="button"
        class="btn-nav"
        aria-label="Previous month"
        :disabled="isLoading"
        @click="handlePrevMonth"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      <div class="month-label-wrap">
        <h2 class="month-title">{{ monthYearTitle }}</h2>
        <span v-if="isLoading" class="loading-indicator">Loading...</span>
      </div>

      <button
        type="button"
        class="btn-nav"
        aria-label="Next month"
        :disabled="isLoading"
        @click="handleNextMonth"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>

    <!-- Day of Week Headers -->
    <div class="dow-grid" aria-hidden="true">
      <div v-for="dow in dayNames" :key="dow" class="dow-cell">
        {{ dow }}
      </div>
    </div>

    <!-- Calendar Grid Cells -->
    <div class="calendar-grid">
      <!-- Empty padding cells for preceding month -->
      <div
        v-for="blank in leadingBlanks"
        :key="`blank-${blank}`"
        class="day-cell cell-empty"
        aria-hidden="true"
      />

      <!-- Active Month Days -->
      <button
        v-for="day in daysInCurrentMonth"
        :key="day.dateStr"
        type="button"
        class="day-cell cell-day"
        :class="{
          'has-duty': day.duty !== null,
          'is-today': day.dateStr === todayDate,
        }"
        :style="day.duty ? { backgroundColor: day.duty.base_color } : {}"
        :aria-label="getDayAriaLabel(day)"
        @click="onCellClick(day.dateStr)"
      >
        <div class="cell-header">
          <span class="day-number tabular-nums">{{ day.dayNumber }}</span>

          <!-- Duty Indicator Badge in Top Right -->
          <span
            v-if="day.duty && day.duty.count_schedules > 0"
            class="duty-badge"
            :class="{ 'badge-tick': day.duty.isCompleted, 'badge-count': !day.duty.isCompleted }"
          >
            <!-- Checkmark tick if all logged -->
            <svg
              v-if="day.duty.isCompleted"
              class="tick-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="3"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <!-- Remaining duties integer counter -->
            <span v-else class="count-text tabular-nums">
              {{ day.duty.remainingDuties }}
            </span>
          </span>
        </div>

        <!-- Base Name Code at Bottom -->
        <div class="cell-footer">
          <span v-if="day.duty" class="base-code">
            {{ day.duty.base_name || day.duty.duty_type }}
          </span>
        </div>
      </button>
    </div>

    <!-- Schedule Duty Type Legend -->
    <div v-if="legend.length > 0" class="calendar-legend">
      <h4 class="legend-heading">Duty Types & Base Legend</h4>
      <div class="legend-items">
        <div
          v-for="item in legend"
          :key="item.code"
          class="legend-pill"
        >
          <span
            class="color-dot"
            :style="{ backgroundColor: item.color }"
          />
          <span class="legend-code">{{ item.code }}</span>
          <span class="legend-label">- {{ item.label }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ScheduleEntry } from '~/stores/schedule';
import { useScheduleStore } from '~/stores/schedule';

const scheduleStore = useScheduleStore();

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const monthYearTitle = computed(() => scheduleStore.monthYearTitle);
const isLoading = computed(() => scheduleStore.isLoading);
const todayDate = computed(() => scheduleStore.today);
const legend = computed(() => scheduleStore.legend);

const leadingBlanks = computed(() => {
  const y = scheduleStore.year;
  const m = scheduleStore.month;
  // Day of week of 1st day (0 = Sun, 6 = Sat)
  const firstDow = new Date(Date.UTC(y, m - 1, 1)).getUTCDay();
  return Array.from({ length: firstDow }, (_, i) => i);
});

interface DayGridItem {
  dayNumber: number;
  dateStr: string;
  duty: ScheduleEntry | null;
}

const daysInCurrentMonth = computed<DayGridItem[]>(() => {
  const y = scheduleStore.year;
  const m = scheduleStore.month;
  const totalDays = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const map = scheduleStore.scheduleMap;

  const result: DayGridItem[] = [];
  for (let d = 1; d <= totalDays; d++) {
    const dStr = String(d).padStart(2, '0');
    const mStr = String(m).padStart(2, '0');
    const dateStr = `${y}-${mStr}-${dStr}`;
    const duty = map.get(dateStr) || null;
    result.push({
      dayNumber: d,
      dateStr,
      duty,
    });
  }
  return result;
});

function handlePrevMonth() {
  scheduleStore.prevMonth();
}

function handleNextMonth() {
  scheduleStore.nextMonth();
}

function onCellClick(dateStr: string) {
  scheduleStore.openDetail(dateStr);
}

function getDayAriaLabel(day: DayGridItem): string {
  if (!day.duty) {
    return `${day.dateStr}: Off duty`;
  }
  const status = day.duty.isCompleted
    ? 'All flights logged'
    : `${day.duty.remainingDuties} duties remaining`;
  return `${day.dateStr}: ${day.duty.base_name} ${day.duty.duty_type}, ${status}`;
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.calendar-wrapper {
  padding: 16px 8px;
  background: $color-surface;
  border-radius: $radius-card;

  @media (max-width: 380px) {
    padding: 14px 6px;
  }
}

.calendar-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}

.btn-nav {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: $tap-target-min;
  min-height: $tap-target-min;
  border-radius: 50%;
  color: $color-primary-navy;
  background-color: rgba(14, 33, 56, 0.05);
  transition: background-color 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover:not(:disabled) {
    background-color: rgba(14, 33, 56, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
}

.month-label-wrap {
  text-align: center;

  .month-title {
    font-size: 17px;
    font-weight: 700;
    color: $color-primary-navy;
    margin: 0;
  }

  .loading-indicator {
    font-size: 11px;
    color: $color-text-secondary;
    display: block;
    margin-top: 2px;
  }
}

.dow-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  margin-bottom: 6px;
  text-align: center;

  .dow-cell {
    font-size: 11px;
    font-weight: 700;
    color: $color-text-secondary;
    padding: 4px 0;
  }
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}

.day-cell {
  min-height: 54px;
  min-width: 44px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4px;
  position: relative;
  transition: transform 0.1s ease, box-shadow 0.1s ease;

  &.cell-empty {
    background: transparent;
    border: none;
    pointer-events: none;
  }

  &.cell-day {
    background-color: #F8FAFC;
    border: 1px solid rgba(14, 33, 56, 0.04);
    color: $color-text-secondary;

    &:hover {
      transform: scale(1.02);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
    }

    &:active {
      transform: scale(0.98);
    }

    &:focus-visible {
      outline: 2px solid $color-chart-accent;
      outline-offset: 1px;
    }
  }

  &.has-duty {
    color: #FFFFFF;
    border: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);

    .day-number {
      color: #FFFFFF;
      font-weight: 700;
    }
  }

  &.is-today {
    outline: 2.5px solid $color-primary-navy;
    outline-offset: -1px;
  }
}

.cell-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  width: 100%;

  .day-number {
    font-size: 11px;
    font-weight: 600;
    line-height: 1;
  }
}

.duty-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  flex-shrink: 0;

  &.badge-tick {
    background-color: #FFFFFF;
    color: $color-primary-navy;

    .tick-icon {
      width: 9px;
      height: 9px;
    }
  }

  &.badge-count {
    background-color: #FFFFFF;
    color: #0E2138;

    .count-text {
      font-size: 8.5px;
      font-weight: 800;
      line-height: 1;
    }
  }
}

.cell-footer {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  width: 100%;
  overflow: hidden;

  .base-code {
    font-size: 9px;
    font-weight: 800;
    letter-spacing: 0.02em;
    line-height: 1;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }
}

.calendar-legend {
  margin-top: 18px;
  border-top: 1px solid $color-border-standard;
  padding-top: 14px;

  .legend-heading {
    font-size: 12px;
    font-weight: 700;
    color: $color-text-primary;
    margin: 0 0 8px 0;
  }

  .legend-items {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 8px 12px;
  }

  .legend-pill {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    line-height: 1.3;

    .color-dot {
      width: 9px;
      height: 9px;
      border-radius: 3px;
      flex-shrink: 0;
    }

    .legend-code {
      font-weight: 700;
      color: $color-text-primary;
      min-width: 28px;
    }

    .legend-label {
      color: $color-text-secondary;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
  }
}
</style>
