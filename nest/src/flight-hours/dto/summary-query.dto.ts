import { IsIn, IsOptional } from 'class-validator';

export class SummaryQueryDto {
  @IsOptional()
  @IsIn(['1w', '1m', '3m', '6m', '1y'], {
    message: 'range must be one of the following values: 1w, 1m, 3m, 6m, 1y',
  })
  range?: '1w' | '1m' | '3m' | '6m' | '1y' = '1w';
}
