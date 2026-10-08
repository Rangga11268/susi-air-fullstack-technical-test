// Pilot store for operational duty metrics, limits, and certifications
import { defineStore } from 'pinia';
import type { PilotUser } from './auth';
import { useAuthStore } from './auth';

export type TimeframeRange = '1w' | '1m' | '3m' | '6m' | '1y';

export interface LimitCard {
  key: 'daily' | 'weekly' | 'monthly' | 'annual';
  label: string;
  windowLabel: string;
  current: number;
  limit: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger';
}

export interface ChartSeriesPoint {
  date: string;
  dailyHours: number;
  rollingHours: number;
  isToday: boolean;
  isFuture: boolean;
  isOverLimit: boolean;
}

export interface ChartData {
  range: string;
  windowDays: number;
  limit: number;
  yMax: number;
  series: ChartSeriesPoint[];
}

export interface FlightHoursSummary {
  today: string;
  range: TimeframeRange;
  cards: LimitCard[];
  chart: ChartData;
}

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: 'safe' | 'soon' | 'expired';
  badgeLabel: string;
}

interface DocumentsResponse {
  today: string;
  warningThresholdDays: number;
  documents: PilotDocument[];
}

export const usePilotStore = defineStore('pilot', {
  state: () => ({
    profile: null as PilotUser | null,
    summary: null as FlightHoursSummary | null,
    documents: [] as PilotDocument[],
    selectedRange: '1w' as TimeframeRange,
    isLoadingProfile: false,
    isLoadingSummary: false,
    isLoadingDocuments: false,
    error: null as string | null,
  }),

  getters: {
    todayDate: (state): string => {
      return state.summary?.today || state.profile?.today || '2026-05-15';
    },
    totalHours: (state): number => {
      return state.profile?.totalFlightHours || 0;
    },
    limitCards: (state): LimitCard[] => {
      return state.summary?.cards || [];
    },
    chartData: (state): ChartData | null => {
      return state.summary?.chart || null;
    },
  },

  actions: {
    async fetchProfile() {
      this.isLoadingProfile = true;
      this.error = null;
      const { apiFetch } = useApi();
      const authStore = useAuthStore();

      try {
        const data = await apiFetch<PilotUser>('/pilot/me');
        this.profile = data;
        authStore.setUser(data);
      } catch (err: any) {
        this.error = err?.message || 'Failed to load pilot profile.';
      } finally {
        this.isLoadingProfile = false;
      }
    },

    async fetchSummary(range?: TimeframeRange) {
      if (range) {
        this.selectedRange = range;
      }
      this.isLoadingSummary = true;
      this.error = null;
      const { apiFetch } = useApi();

      try {
        const data = await apiFetch<FlightHoursSummary>(
          `/flight-hours/summary?range=${this.selectedRange}`,
        );
        this.summary = data;
      } catch (err: any) {
        this.error = err?.message || 'Failed to load flight hours summary.';
      } finally {
        this.isLoadingSummary = false;
      }
    },

    async fetchDocuments() {
      this.isLoadingDocuments = true;
      this.error = null;
      const { apiFetch } = useApi();

      try {
        const data = await apiFetch<DocumentsResponse>('/documents');
        this.documents = data.documents || [];
      } catch (err: any) {
        this.error = err?.message || 'Failed to load pilot documents.';
      } finally {
        this.isLoadingDocuments = false;
      }
    },

    async setRange(range: TimeframeRange) {
      if (this.selectedRange === range && this.summary) return;
      this.selectedRange = range;
      await this.fetchSummary(range);
    },

    async fetchAll() {
      await Promise.all([
        this.fetchProfile(),
        this.fetchSummary(this.selectedRange),
        this.fetchDocuments(),
      ]);
    },
  },
});
