import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

export type DocumentStatus = 'expired' | 'soon' | 'safe';

export interface PilotDocument {
  id: string;
  label: string;
  expiryDate: string;
  daysRemaining: number;
  status: DocumentStatus;
  badgeLabel: string;
}

export interface DocumentsResponse {
  today: string;
  warningThresholdDays: number;
  documents: PilotDocument[];
}

@Injectable()
export class DocumentsService {
  constructor(private readonly dataService: DataService) {}

  private calculateDaysRemaining(expiryDateStr: string, todayStr: string): number {
    const [tYear, tMonth, tDay] = todayStr.split('-').map(Number);
    const [eYear, eMonth, eDay] = expiryDateStr.split('-').map(Number);

    const tDate = Date.UTC(tYear, tMonth - 1, tDay);
    const eDate = Date.UTC(eYear, eMonth - 1, eDay);

    return Math.round((eDate - tDate) / (86400 * 1000));
  }

  getDocuments(): DocumentsResponse {
    const today = this.dataService.getAppToday();
    const rawDocs = this.dataService.getDocumentsList();
    const warningThresholdDays = 30;

    const documents: PilotDocument[] = rawDocs.map((doc) => {
      const daysRemaining = this.calculateDaysRemaining(doc.expiryDate, today);
      let status: DocumentStatus;
      let badgeLabel: string;

      if (daysRemaining <= 0) {
        status = 'expired';
        badgeLabel = 'Expired';
      } else if (daysRemaining <= warningThresholdDays) {
        status = 'soon';
        badgeLabel = `${daysRemaining}d left`;
      } else {
        status = 'safe';
        badgeLabel = `${daysRemaining}d left`;
      }

      return {
        id: doc.id,
        label: doc.label,
        expiryDate: doc.expiryDate,
        daysRemaining,
        status,
        badgeLabel,
      };
    });

    return {
      today,
      warningThresholdDays,
      documents,
    };
  }
}
