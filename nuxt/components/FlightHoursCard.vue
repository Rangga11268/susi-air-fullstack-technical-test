<template>
  <div class="limit-card" :class="`status-${card.status}`">
    <div class="card-head">
      <div class="title-group">
        <h3 class="card-label">{{ card.label }}</h3>
        <span class="window-label">{{ card.windowLabel }}</span>
      </div>
      <span class="percentage-pill tabular-nums" :class="`pill-${card.status}`">
        {{ card.percentage }}%
      </span>
    </div>

    <div class="hours-ratio">
      <span class="current-value tabular-nums">{{ formattedCurrent }}</span>
      <span class="limit-slash">/</span>
      <span class="limit-value tabular-nums">{{ formattedLimit }} hrs</span>
    </div>

    <div class="progress-track" role="progressbar" :aria-valuenow="card.percentage" aria-valuemin="0" aria-valuemax="100">
      <div
        class="progress-fill"
        :class="`fill-${card.status}`"
        :style="{ width: progressWidth }"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { LimitCard } from '~/stores/pilot';

const props = defineProps<{
  card: LimitCard;
}>();

const formattedCurrent = computed(() => {
  return Number(props.card.current).toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
});

const formattedLimit = computed(() => {
  return Number(props.card.limit).toLocaleString('en-US');
});

const progressWidth = computed(() => {
  const pct = Math.min(100, Math.max(0, props.card.percentage));
  return `${pct}%`;
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.limit-card {
  background: $color-surface;
  border-radius: $radius-card;
  border: 1px solid $color-border-subtle;
  box-shadow: $card-shadow;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 110px;
  transition: transform 0.15s ease, box-shadow 0.15s ease;

  &.status-danger {
    border-color: rgba(230, 55, 87, 0.3);
  }
}

.card-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 8px;
}

.title-group {
  display: flex;
  flex-direction: column;

  .card-label {
    font-size: 14px;
    font-weight: 700;
    color: $color-text-primary;
    line-height: 1.2;
    margin: 0;
  }

  .window-label {
    font-size: 11px;
    color: $color-text-secondary;
    margin-top: 2px;
  }
}

.percentage-pill {
  font-size: 11px;
  font-weight: 700;
  padding: 2px 7px;
  border-radius: $radius-pill;

  &.pill-safe {
    background-color: rgba(31, 191, 143, 0.12);
    color: $color-success;
  }

  &.pill-warning {
    background-color: rgba(245, 158, 11, 0.14);
    color: $color-warning;
  }

  &.pill-danger {
    background-color: rgba(230, 55, 87, 0.14);
    color: $color-danger;
  }
}

.hours-ratio {
  display: flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 10px;

  .current-value {
    font-size: 18px;
    font-weight: 800;
    color: $color-text-primary;
    line-height: 1;
  }

  .limit-slash {
    font-size: 13px;
    color: $color-text-muted;
    font-weight: 500;
  }

  .limit-value {
    font-size: 12px;
    color: $color-text-secondary;
    font-weight: 600;
  }
}

.progress-track {
  width: 100%;
  height: 6px;
  background-color: rgba(14, 33, 56, 0.08);
  border-radius: $radius-pill;
  overflow: hidden;

  .progress-fill {
    height: 100%;
    border-radius: $radius-pill;
    transition: width 0.3s ease;

    &.fill-safe {
      background-color: $color-chart-accent;
    }

    &.fill-warning {
      background-color: $color-warning;
    }

    &.fill-danger {
      background-color: $color-danger;
    }
  }
}
</style>
