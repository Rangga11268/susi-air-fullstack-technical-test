// Schedule store for monthly roster and duty tracking
import { defineStore } from 'pinia';

export interface ScheduleEntry {
  id: string;
  duty_date: string;
  status: number;
  base_name: string;
  base_color: string;
  duty_type: string;
  count_schedules: number;
  count_logbooks: number;
  isCompleted: boolean;
  remainingDuties: number;
}

export interface ScheduleLegendItem {
  code: string;
  label: string;
  color: string;
}

export interface SchedulesResponse {
  today: string;
  year: number;
  month: number;
  legend: ScheduleLegendItem[];
  schedules: ScheduleEntry[];
}

export const useScheduleStore = defineStore('schedule', {
  state: () => ({
    year: 2026,
    month: 5,
    today: '2026-05-15',
    schedules: [] as ScheduleEntry[],
    legend: [] as ScheduleLegendItem[],
    selectedDate: null as string | null,
    selectedSchedule: null as ScheduleEntry | null,
    isDetailOpen: false,
    isLoading: false,
    error: null as string | null,
  }),

  getters: {
    scheduleMap: (state): Map<string, ScheduleEntry> => {
      const map = new Map<string, ScheduleEntry>();
      for (const item of state.schedules) {
        map.set(item.duty_date, item);
      }
      return map;
    },
    monthName: (state): string => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      return monthNames[state.month - 1] || '';
    },
    monthYearTitle: (state): string => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      return `${monthNames[state.month - 1] || ''} ${state.year}`;
    },
  },

  actions: {
    async fetchSchedules(year?: number, month?: number) {
      if (year !== undefined) this.year = year;
      if (month !== undefined) this.month = month;

      this.isLoading = true;
      this.error = null;
      const { apiFetch } = useApi();

      try {
        const data = await apiFetch<SchedulesResponse>(
          `/schedules?year=${this.year}&month=${this.month}`,
        );
        this.schedules = data.schedules || [];
        this.legend = data.legend || [];
        if (data.today) {
          this.today = data.today;
        }
      } catch (err: any) {
        this.error = err?.message || 'Failed to load schedule for this month.';
      } finally {
        this.isLoading = false;
      }
    },

    async prevMonth() {
      if (this.isLoading) return;
      let newYear = this.year;
      let newMonth = this.month - 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
      await this.fetchSchedules(newYear, newMonth);
    },

    async nextMonth() {
      if (this.isLoading) return;
      let newYear = this.year;
      let newMonth = this.month + 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
      await this.fetchSchedules(newYear, newMonth);
    },

    openDetail(dateStr: string) {
      this.selectedDate = dateStr;
      this.selectedSchedule =
        this.schedules.find((s) => s.duty_date === dateStr) || null;
      this.isDetailOpen = true;
    },

    closeDetail() {
      this.isDetailOpen = false;
      this.selectedDate = null;
      this.selectedSchedule = null;
    },
  },
});
