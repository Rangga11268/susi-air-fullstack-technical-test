import { Injectable } from '@nestjs/common';
import { DataService } from '../data/data.service';

@Injectable()
export class PilotService {
  constructor(private readonly dataService: DataService) {}

  getProfile() {
    return this.dataService.getPilotProfile();
  }
}
