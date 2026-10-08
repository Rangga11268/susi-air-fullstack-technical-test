import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { APP_CONFIG } from '../config/app.config';

@Injectable()
export class DataService implements OnModuleInit {
  private readonly logger = new Logger(DataService.name);

  private appToday: string = APP_CONFIG.today;
  private pilotProfile: any;
  private limits: Record<string, number> = {};
  private chartBounds: Record<string, any> = {};
  private flightHoursMap: Map<string, number> = new Map();
  private flightHoursList: Array<{ date: string; hours: number }> = [];
  private documentsList: Array<{ id: string; label: string; expiryDate: string }> = [];
  private scheduleLegend: Array<{ code: string; label: string; color: string }> = [];
  private rawSchedules: any[] = [];

  onModuleInit() {
    this.appToday = process.env.APP_TODAY || APP_CONFIG.today;
    this.logger.log(`Initialized operational anchor APP_TODAY: ${this.appToday}`);
    this.loadDatasets();
  }

  private resolveDocsPath(): string {
    const candidates = [
      process.env.DATA_DIR,
      path.resolve(process.cwd(), 'data'),
      path.resolve(__dirname, '../../data'),
      path.resolve(__dirname, '../data'),
      path.resolve(process.cwd(), 'docs'),
      path.resolve(process.cwd(), '../docs'),
      path.resolve(__dirname, '../../../docs'),
      path.resolve(__dirname, '../../docs'),
    ].filter(Boolean) as string[];

    for (const dir of candidates) {
      if (
        fs.existsSync(path.join(dir, 'mock-flight-hours.json')) &&
        fs.existsSync(path.join(dir, 'mock-documents.json')) &&
        fs.existsSync(path.join(dir, 'mock-schedules.json'))
      ) {
        this.logger.log(`Resolved seed mock datasets at: ${dir}`);
        return dir;
      }
    }

    throw new Error(
      `Unable to locate mock datasets in any candidate path: ${candidates.join(', ')}`,
    );
  }

  private loadDatasets() {
    const dir = this.resolveDocsPath();

    const flightHoursRaw = JSON.parse(
      fs.readFileSync(path.join(dir, 'mock-flight-hours.json'), 'utf8'),
    );
    this.pilotProfile = {
      username: 'johndoe',
      name: flightHoursRaw.pilot?.name || 'John Doe',
      role: 'Line Captain · C208B Grand Caravan',
      base: 'CJN (Pangandaran)',
      totalFlightHours: Number(flightHoursRaw.pilot?.totalFlightHours || 1444.5),
      today: this.appToday,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=JohnDoe',
    };
    this.limits = flightHoursRaw.limits || {};
    this.chartBounds = flightHoursRaw.chartBounds || {};
    this.flightHoursList = flightHoursRaw.flightHours || [];
    this.flightHoursMap.clear();
    for (const item of this.flightHoursList) {
      this.flightHoursMap.set(item.date, Number(item.hours));
    }

    const documentsRaw = JSON.parse(
      fs.readFileSync(path.join(dir, 'mock-documents.json'), 'utf8'),
    );
    this.documentsList = documentsRaw.documents || [];

    const schedulesRaw = JSON.parse(
      fs.readFileSync(path.join(dir, 'mock-schedules.json'), 'utf8'),
    );
    this.scheduleLegend = schedulesRaw.legend || [];
    this.rawSchedules = schedulesRaw.schedules || [];

    this.logger.log(
      `Seeded: ${this.flightHoursMap.size} flight days, ${this.documentsList.length} documents, ${this.rawSchedules.length} schedules.`,
    );
  }

  getAppToday(): string {
    return this.appToday;
  }

  getPilotProfile(): any {
    return this.pilotProfile;
  }

  getLimits(): Record<string, number> {
    return this.limits;
  }

  getChartBounds(range: string): any {
    return this.chartBounds[range];
  }

  getAllChartBounds(): Record<string, any> {
    return this.chartBounds;
  }

  getFlightHoursMap(): Map<string, number> {
    return this.flightHoursMap;
  }

  getFlightHoursList(): Array<{ date: string; hours: number }> {
    return this.flightHoursList;
  }

  getDocumentsList(): Array<{ id: string; label: string; expiryDate: string }> {
    return this.documentsList;
  }

  getScheduleLegend(): Array<{ code: string; label: string; color: string }> {
    return this.scheduleLegend;
  }

  getRawSchedules(): any[] {
    return this.rawSchedules;
  }
}
