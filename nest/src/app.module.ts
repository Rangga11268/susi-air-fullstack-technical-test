import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DataModule } from './data/data.module';
import { AuthModule } from './auth/auth.module';
import { PilotModule } from './pilot/pilot.module';
import { FlightHoursModule } from './flight-hours/flight-hours.module';
import { DocumentsModule } from './documents/documents.module';
import { SchedulesModule } from './schedules/schedules.module';
import { AuthGuard } from './common/guards/auth.guard';

@Module({
  imports: [
    DataModule,
    AuthModule,
    PilotModule,
    FlightHoursModule,
    DocumentsModule,
    SchedulesModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
