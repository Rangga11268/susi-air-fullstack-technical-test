import { Injectable, BadRequestException } from '@nestjs/common';
import { DataService } from '../data/data.service';

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

@Injectable()
export class FlightHoursService {
  constructor(private readonly dataService: DataService) {}

  addDays(dateStr: string, days: number): string {
    const [year, month, day] = dateStr.split('-').map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return date.toISOString().slice(0, 10);
  }

  calculateRollingSum(targetDate: string, windowDays: number): number {
    let sum = 0;
    for (let i = 0; i < windowDays; i++) {
      const date = this.addDays(targetDate, -i);
      sum += this.dataService.getFlightHoursMap().get(date) ?? 0;
    }
    return Math.round(sum * 10) / 10;
  }

  private getCardStatus(percentage: number): 'safe' | 'warning' | 'danger' {
    if (percentage >= 100) return 'danger';
    if (percentage >= 80) return 'warning';
    return 'safe';
  }

  getFlightHoursRange(from: string, to: string) {
    if (from > to) {
      throw new BadRequestException('from date must be before or equal to to date');
    }

    const entries: Array<{ date: string; hours: number }> = [];
    let currentDate = from;
    let totalHours = 0;

    while (currentDate <= to) {
      const hours = this.dataService.getFlightHoursMap().get(currentDate) ?? 0.0;
      entries.push({ date: currentDate, hours });
      totalHours += hours;
      currentDate = this.addDays(currentDate, 1);
    }

    return {
      from,
      to,
      totalHours: Math.round(totalHours * 10) / 10,
      entries,
    };
  }

  getSummary(range: '1w' | '1m' | '3m' | '6m' | '1y' = '1w') {
    const today = this.dataService.getAppToday();
    const limits = this.dataService.getLimits();

    const dailyHours = this.calculateRollingSum(today, 1);
    const weeklyHours = this.calculateRollingSum(today, 7);
    const monthlyHours = this.calculateRollingSum(today, 30);
    const annualHours = this.calculateRollingSum(today, 365);

    const dailyLimit = limits.daily ?? 8;
    const weeklyLimit = limits.weekly ?? 40;
    const monthlyLimit = limits.monthly ?? 100;
    const annualLimit = limits.annual ?? 1050;

    const cards: LimitCard[] = [
      {
        key: 'daily',
        label: 'Daily',
        windowLabel: 'Today only',
        current: dailyHours,
        limit: dailyLimit,
        percentage: Math.round((dailyHours / dailyLimit) * 1000) / 10,
        status: this.getCardStatus((dailyHours / dailyLimit) * 100),
      },
      {
        key: 'weekly',
        label: 'Weekly',
        windowLabel: 'Rolling 7 days',
        current: weeklyHours,
        limit: weeklyLimit,
        percentage: Math.round((weeklyHours / weeklyLimit) * 1000) / 10,
        status: this.getCardStatus((weeklyHours / weeklyLimit) * 100),
      },
      {
        key: 'monthly',
        label: 'Monthly',
        windowLabel: 'Rolling 30 days',
        current: monthlyHours,
        limit: monthlyLimit,
        percentage: Math.round((monthlyHours / monthlyLimit) * 1000) / 10,
        status: this.getCardStatus((monthlyHours / monthlyLimit) * 100),
      },
      {
        key: 'annual',
        label: 'Annual',
        windowLabel: 'Rolling 365 days',
        current: annualHours,
        limit: annualLimit,
        percentage: Math.round((annualHours / annualLimit) * 1000) / 10,
        status: this.getCardStatus((annualHours / annualLimit) * 100),
      },
    ];

    const bounds = this.dataService.getChartBounds(range) || {
      limit: 40,
      max: 45,
      windowDays: 7,
    };

    const windowDays = bounds.windowDays;
    const limit = bounds.limit;
    const yMax = bounds.max;

    const series: ChartSeriesPoint[] = [];

    for (let offset = -7; offset <= 7; offset++) {
      const date = this.addDays(today, offset);
      const dailyHoursForDate =
        this.dataService.getFlightHoursMap().get(date) ?? 0.0;
      const rollingHours = this.calculateRollingSum(date, windowDays);

      series.push({
        date,
        dailyHours: dailyHoursForDate,
        rollingHours,
        isToday: date === today,
        isFuture: date > today,
        isOverLimit: rollingHours > limit,
      });
    }

    const chart: ChartData = {
      range,
      windowDays,
      limit,
      yMax,
      series,
    };

    return {
      today,
      range,
      cards,
      chart,
    };
  }
}
