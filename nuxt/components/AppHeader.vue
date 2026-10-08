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
          @error="onAvatarError"
        />
      </div>
    </div>

    <div class="hours-kpi-card">
      <div class="kpi-aircraft-cell">
        <img
          src="/images/susiair-caravan-hd.jpg"
          alt="Cessna C208B Grand Caravan"
          class="kpi-aircraft-img"
        />
      </div>
      <div class="kpi-content">
        <span class="kpi-label">TOTAL FLIGHT HOURS</span>
        <div class="kpi-value-row">
          <span class="kpi-value tabular-nums">{{ formattedHours }} <small>hrs</small></span>
          <span class="kpi-fleet-tag">C208B · PK-CAV</span>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useAuthStore } from '~/stores/auth';
import { usePilotStore } from '~/stores/pilot';

const authStore = useAuthStore();
const pilotStore = usePilotStore();

const avatarFailed = ref(false);

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
  if (avatarFailed.value) return '/images/pilot-avatar.jpg';
  const candidate = pilotStore.profile?.avatarUrl || authStore.user?.avatarUrl || '';
  if (!candidate || candidate.includes('dicebear.com')) {
    return '/images/pilot-avatar.jpg';
  }
  return candidate;
});

function onAvatarError() {
  avatarFailed.value = true;
}

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
  position: relative;
  overflow: hidden;
  color: #FFFFFF;
  padding: 20px 16px 24px;
  border-radius: 0 0 22px 22px;
  box-shadow: 0 6px 20px rgba(10, 23, 39, 0.22);

  // HD aerial photo + dark navy operational overlay
  background-image:
    linear-gradient(
      165deg,
      rgba(8, 18, 34, 0.72) 0%,
      rgba(14, 33, 56, 0.88) 55%,
      rgba(10, 24, 42, 0.96) 100%
    ),
    url('/images/susiair-hero-bg.jpg');
  background-size: cover;
  background-position: center 35%;
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
  background-color: rgba(10, 23, 39, 0.65);
  border: 1px solid rgba(255, 255, 255, 0.14);
  color: rgba(255, 255, 255, 0.92);
  letter-spacing: 0.02em;
}

.btn-logout {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: $tap-target-min;
  min-height: $tap-target-min;
  color: rgba(255, 255, 255, 0.8);
  border-radius: 50%;
  transition: color 0.15s ease, background-color 0.15s ease;

  svg {
    width: 20px;
    height: 20px;
  }

  &:hover {
    color: #FFFFFF;
    background-color: rgba(255, 255, 255, 0.12);
  }

  &:focus-visible {
    outline: 2px solid $color-chart-accent;
    outline-offset: 2px;
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
    font-size: 11.5px;
    font-weight: 700;
    color: $color-chart-accent;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    display: block;
    margin-bottom: 3px;
  }

  .pilot-name {
    font-size: 22px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.15;
    margin: 0;
    letter-spacing: -0.3px;
    text-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
  }

  .pilot-subtext {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.82);
    margin-top: 4px;
  }

  .pilot-base {
    font-size: 11px;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.68);
    margin-top: 1px;
  }
}

.pilot-avatar-wrapper {
  margin-left: 12px;

  .pilot-avatar {
    width: 58px;
    height: 58px;
    border-radius: 50%;
    object-fit: cover;
    border: 2.5px solid rgba(255, 255, 255, 0.45);
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
    background-color: #0E2138;
  }
}

.hours-kpi-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background-color: rgba(10, 23, 39, 0.78);
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: $radius-card;
  padding: 10px 14px;
}

.kpi-aircraft-cell {
  width: 68px;
  height: 48px;
  border-radius: 10px;
  overflow: hidden;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background-color: #0E2138;

  .kpi-aircraft-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center 45%;
    display: block;
  }
}

.kpi-content {
  flex: 1;
  display: flex;
  flex-direction: column;

  .kpi-label {
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.07em;
    color: rgba(255, 255, 255, 0.72);
  }

  .kpi-value-row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 8px;
    margin-top: 2px;
  }

  .kpi-value {
    font-size: 24px;
    font-weight: 800;
    color: #FFFFFF;
    line-height: 1.1;

    small {
      font-size: 13px;
      font-weight: 600;
      color: rgba(255, 255, 255, 0.75);
      margin-left: 2px;
    }
  }

  .kpi-fleet-tag {
    font-size: 10.5px;
    font-weight: 600;
    color: $color-chart-accent;
    letter-spacing: 0.03em;
  }
}
</style>
