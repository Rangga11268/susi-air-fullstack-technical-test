import { Controller, Get, Query } from '@nestjs/common';
import { SchedulesService } from './schedules.service';
import { SchedulesQueryDto } from './dto/schedules-query.dto';

@Controller('schedules')
export class SchedulesController {
  constructor(private readonly schedulesService: SchedulesService) {}

  @Get()
  getSchedules(@Query() query: SchedulesQueryDto) {
    return this.schedulesService.getSchedules(query.year, query.month);
  }
}
