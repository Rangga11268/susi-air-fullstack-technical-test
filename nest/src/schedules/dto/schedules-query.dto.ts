import { Type } from 'class-transformer';
import { IsInt, Max, Min } from 'class-validator';

export class SchedulesQueryDto {
  @Type(() => Number)
  @IsInt({ message: 'year must be an integer' })
  @Min(2020)
  @Max(2030)
  year: number;

  @Type(() => Number)
  @IsInt({ message: 'month must be an integer' })
  @Min(1)
  @Max(12)
  month: number;
}
