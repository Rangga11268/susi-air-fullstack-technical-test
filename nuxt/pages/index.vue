<template>
  <div class="home-page">
    <!-- Pilot Identity Header -->
    <AppHeader />

    <!-- Main Content Container -->
    <main class="page-content">
      <!-- Error Banner with Retry Button -->
      <div v-if="error" class="error-banner card" role="alert">
        <div class="error-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="error-info">
          <strong class="error-title">Unable to Load Operational Data</strong>
          <p class="error-desc">{{ error }}</p>
          <button type="button" class="btn-retry" @click="loadAllData">
            Try Again
          </button>
        </div>
      </div>

      <!-- Section: Regulatory Flight Limits (4 Cards) -->
      <section class="section-block" aria-labelledby="limits-heading">
        <div class="section-header">
          <div>
            <h2 id="limits-heading" class="section-title">Regulatory Flight Limits</h2>
            <p class="section-subtitle">Rolling duty hours vs DGCA regulatory maximums</p>
          </div>
        </div>

        <!-- Skeleton Loading Grid -->
        <div v-if="isLoadingSummary && limitCards.length === 0" class="cards-grid">
          <div v-for="i in 4" :key="`skel-${i}`" class="card-skeleton" />
        </div>

        <!-- 2x2 Limit Cards Grid -->
        <div v-else class="cards-grid">
          <FlightHoursCard
            v-for="card in limitCards"
            :key="card.key"
            :card="card"
          />
        </div>
      </section>

      <!-- Section: 15-Day Rolling Sum Trend Chart -->
      <section class="section-block" aria-labelledby="chart-heading">
        <FlightHoursChart />
      </section>

      <!-- Section: My Documents & Licences -->
      <section class="section-block" aria-labelledby="documents-heading">
        <div class="section-header">
          <div>
            <h2 id="documents-heading" class="section-title">My Documents & Licences</h2>
            <p class="section-subtitle">Pilot medical, flight certificates, and recurrent dates</p>
          </div>
          <span class="count-pill">{{ documents.length }} Items</span>
        </div>

        <!-- Skeleton Loading List -->
        <div v-if="isLoadingDocuments && documents.length === 0" class="doc-list">
          <div v-for="i in 3" :key="`doc-skel-${i}`" class="doc-skeleton" />
        </div>

        <!-- Empty Documents State -->
        <div v-else-if="documents.length === 0" class="empty-state card">
          <p>No documents found for this pilot profile.</p>
        </div>

        <!-- Documents List -->
        <div v-else class="doc-list">
          <DocumentCard
            v-for="doc in documents"
            :key="doc.id"
            :document="doc"
          />
        </div>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { usePilotStore } from '~/stores/pilot';

const pilotStore = usePilotStore();

const limitCards = computed(() => pilotStore.limitCards);
const documents = computed(() => pilotStore.documents);
const isLoadingSummary = computed(() => pilotStore.isLoadingSummary);
const isLoadingDocuments = computed(() => pilotStore.isLoadingDocuments);
const error = computed(() => pilotStore.error);

async function loadAllData() {
  await pilotStore.fetchAll();
}

onMounted(() => {
  loadAllData();
});
</script>

<style scoped lang="scss">
@use '~/assets/scss/variables' as *;

.home-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.section-block {
  margin-bottom: 20px;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.card-skeleton {
  min-height: 110px;
  border-radius: $radius-card;
  background: linear-gradient(90deg, #E2E8F0 25%, #EDF2F7 50%, #E2E8F0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.doc-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.doc-skeleton {
  height: 62px;
  border-radius: $radius-card;
  background: linear-gradient(90deg, #E2E8F0 25%, #EDF2F7 50%, #E2E8F0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.count-pill {
  font-size: 11.5px;
  font-weight: 700;
  color: $color-text-secondary;
  font-variant-numeric: tabular-nums;
}

.empty-state {
  text-align: center;
  padding: 24px 16px;
  color: $color-text-secondary;
  font-size: 13px;
}

.error-banner {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  background-color: rgba(230, 55, 87, 0.08);
  border-color: rgba(230, 55, 87, 0.3);
  margin-bottom: 16px;

  .error-icon {
    color: $color-brand-red;
    flex-shrink: 0;
    margin-top: 2px;

    svg {
      width: 20px;
      height: 20px;
    }
  }

  .error-info {
    flex: 1;

    .error-title {
      font-size: 13px;
      font-weight: 700;
      color: $color-brand-red;
      display: block;
    }

    .error-desc {
      font-size: 12px;
      color: $color-text-primary;
      margin: 3px 0 8px 0;
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
}
</style>
