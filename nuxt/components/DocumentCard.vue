<template>
  <div class="document-card card" :class="`status-${document.status}`">
    <div class="doc-icon-wrapper" :class="`icon-${document.status}`">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
    </div>

    <div class="doc-details">
      <h4 class="doc-title">{{ document.label }}</h4>
      <div class="doc-meta">
        <span class="expiry-date">Expires: {{ formattedExpiry }}</span>
        <span class="days-countdown" :class="`text-${document.status}`">
          {{ countdownText }}
        </span>
      </div>
    </div>

    <div class="doc-badge-col">
      <span class="badge" :class="`badge-${document.status}`">
        {{ badgeText }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { PilotDocument } from '~/stores/pilot';

const props = defineProps<{
  document: PilotDocument;
}>();

const formattedExpiry = computed(() => {
  try {
    const [year, month, day] = props.document.expiryDate.split('-').map(Number);
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${day} ${months[month - 1]} ${year}`;
  } catch {
    return props.document.expiryDate;
  }
});

const countdownText = computed(() => {
  const d = props.document.daysRemaining;
  if (d < 0) {
    return `Overdue by ${Math.abs(d)}d`;
  }
  if (d === 0) {
    return 'Expires today';
  }
  return `${d} days remaining`;
});

const badgeText = computed(() => {
  if (props.document.status === 'expired') return 'Expired';
  if (props.document.status === 'soon') return props.document.badgeLabel || 'Soon';
  return props.document.badgeLabel || 'Safe';
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.document-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: $radius-card;
  transition: transform 0.15s ease;

  &.status-expired {
    border-color: rgba(230, 55, 87, 0.25);
    background-color: #FFFDFD;
  }

  &.status-soon {
    border-color: rgba(245, 158, 11, 0.25);
  }
}

.doc-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  flex-shrink: 0;

  svg {
    width: 20px;
    height: 20px;
  }

  &.icon-safe {
    background-color: rgba(31, 191, 143, 0.12);
    color: $color-success;
  }

  &.icon-soon {
    background-color: rgba(245, 158, 11, 0.12);
    color: $color-warning;
  }

  &.icon-expired {
    background-color: rgba(230, 55, 87, 0.12);
    color: $color-danger;
  }
}

.doc-details {
  flex: 1;
  min-width: 0;

  .doc-title {
    font-size: 13px;
    font-weight: 700;
    color: $color-text-primary;
    line-height: 1.25;
    margin: 0 0 3px 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .doc-meta {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 11px;
    color: $color-text-secondary;
  }

  .expiry-date {
    font-variant-numeric: tabular-nums;
  }

  .days-countdown {
    font-weight: 600;

    &.text-safe {
      color: $color-success;
    }

    &.text-soon {
      color: $color-warning;
    }

    &.text-expired {
      color: $color-danger;
    }
  }
}

.doc-badge-col {
  flex-shrink: 0;
}
</style>
