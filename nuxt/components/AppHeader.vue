<template>
  <header class="pilot-header">
    <div class="header-top">
      <div class="brand-badge">
        <img
          src="/images/susiairlogo.png"
          alt="Susi Air Logo"
          class="header-logo"
        />
      </div>
      <div class="header-actions">
        <span class="date-pill tabular-nums">{{ formattedDate }}</span>
        <button
          type="button"
          class="btn-logout"
          aria-label="Sign Out"
          title="Sign Out"
          @click="handleLogout"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="pilot-profile-row">
      <div class="pilot-info">
        <span class="greeting-tag">Duty Ready, Capt.</span>
        <h1 class="pilot-name">{{ pilotName }}</h1>
        <p class="pilot-subtext">{{ pilotRank }}</p>
        <p class="pilot-base">{{ pilotBase }}</p>
      </div>
      <div class="pilot-avatar-wrapper">
        <img
          :src="avatarUrl"
          :alt="pilotName"
          class="pilot-avatar"
        />
      </div>
    </div>

    <div class="hours-kpi-card">
      <div class="kpi-icon-cell">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      </div>
      <div class="kpi-content">
        <span class="kpi-label">TOTAL FLIGHT HOURS</span>
        <span class="kpi-value tabular-nums">{{ formattedHours }} <small>hrs</small></span>
      </div>
    </div>
  </header>
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

const pilotRank = computed(() => {
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

const formattedHours = computed(() => {
  const hours = pilotStore.profile?.totalFlightHours || authStore.user?.totalFlightHours || 1444.5;
  return Number(hours).toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
});

const formattedDate = computed(() => {
  const dateStr = pilotStore.todayDate;
  if (!dateStr) return 'Fri, 15 May 2026';
  try {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day));
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${dayNames[date.getUTCDay()]}, ${date.getUTCDate()} ${monthNames[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  } catch {
    return dateStr;
  }
});

function handleLogout() {
  authStore.logout();
}
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.pilot-header {
  background: linear-gradient(180deg, #0A1727 0%, #0E2138 100%);
  color: $color-text-inverse;
  padding: 20px 16px 24px;
  border-radius: 0 0 20px 20px;
  box-shadow: 0 4px 14px rgba(10, 23, 39, 0.15);
}

.header-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.brand-badge {
  display: flex;
  align-items: center;

  .header-logo {
    height: 32px;
    width: auto;
    object-fit: contain;
  }
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.date-pill {
  font-size: 11px;
  font-weight: 600;
  padding: 5px 10px;
  border-radius: $radius-pill;
  background-color: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.9);
  letter-spacing: 0.02em;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: $tap-target-min;
  min-height: $tap-target-min;
  color: rgba(255, 255, 255, 0.7);
  border-radius: 50%;
  transition: color 0.15s ease, background-color 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.1);
  }
}

.pilot-profile-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.pilot-info {
  flex: 1;

  .greeting-tag {
    font-size: 12px;
    font-weight: 600;
    color: $color-chart-accent;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 2px;
  }

  .pilot-name {
    font-size: 20px;
    font-weight: 700;
    color: #FFFFFF;
    line-height: 1.2;
    margin: 0;
  }

  .pilot-subtext {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.75);
    margin-top: 3px;
  }

  .pilot-base {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 1px;
  }
}

.pilot-avatar-wrapper {
  margin-left: 12px;

  .pilot-avatar {
    width: 52px;
    height: 52px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.25);
    background-color: rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
}

.hours-kpi-card {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: $radius-card;
  padding: 12px 14px;

  .kpi-icon-cell {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 38px;
    height: 38px;
    border-radius: 10px;
    background-color: rgba(34, 197, 232, 0.15);
    color: $color-chart-accent;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .kpi-content {
    display: flex;
    flex-direction: column;

    .kpi-label {
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: rgba(255, 255, 255, 0.7);
    }

    .kpi-value {
      font-size: 22px;
      font-weight: 800;
      color: #FFFFFF;
      line-height: 1.1;
      margin-top: 2px;

      small {
        font-size: 13px;
        font-weight: 600;
        color: rgba(255, 255, 255, 0.7);
        margin-left: 2px;
      }
    }
  }
}
</style>
