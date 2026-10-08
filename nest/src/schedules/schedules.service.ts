import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

export interface ScheduleLegendItem {
  code: string;
  label: string;
  color: string;
}

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

export interface SchedulesResponse {
  today: string;
  year: number;
  month: number;
  legend: ScheduleLegendItem[];
  schedules: ScheduleEntry[];
}

@Injectable()
export class SchedulesService {
  constructor(private readonly dataService: DataService) {}

  getSchedules(year: number, month: number): SchedulesResponse {
    const today = this.dataService.getAppToday();
    const legend = this.dataService.getScheduleLegend();
    const rawSchedules = this.dataService.getRawSchedules();

    const monthPrefix = `${year}-${String(month).padStart(2, '0')}`;

    const filtered = rawSchedules.filter((item) =>
      item.duty_date && item.duty_date.startsWith(monthPrefix),
    );

    filtered.sort((a, b) => a.duty_date.localeCompare(b.duty_date));

    const schedules: ScheduleEntry[] = filtered.map((item) => {
      const countSchedules = Number(item.count_schedules || 0);
      const countLogbooks = Number(item.count_logbooks || 0);
      const isCompleted = countLogbooks === countSchedules;
      const remainingDuties = Math.max(0, countSchedules - countLogbooks);

      return {
        id: String(item.id),
        duty_date: item.duty_date,
        status: Number(item.status || 1),
        base_name: item.base_name || '',
        base_color: item.base_color || '#10B981',
        duty_type: item.duty_type || 'DTY',
        count_schedules: countSchedules,
        count_logbooks: countLogbooks,
        isCompleted,
        remainingDuties,
      };
    });

    return {
      today,
      year: Number(year),
      month: Number(month),
      legend,
      schedules,
    };
  }
}
