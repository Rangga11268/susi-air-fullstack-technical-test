import { Controller, Get, Query } from '@nestjs/common';
import { FlightHoursService } from './flight-hours.service';
import { FlightHoursQueryDto } from './dto/flight-hours-query.dto';
import { SummaryQueryDto } from './dto/summary-query.dto';

@Controller('flight-hours')
export class FlightHoursController {
  constructor(private readonly flightHoursService: FlightHoursService) {}

  @Get('summary')
  getSummary(@Query() query: SummaryQueryDto) {
    return this.flightHoursService.getSummary(query.range);
  }

  @Get()
  getFlightHours(@Query() query: FlightHoursQueryDto) {
    return this.flightHoursService.getFlightHoursRange(query.from, query.to);
  }
}
