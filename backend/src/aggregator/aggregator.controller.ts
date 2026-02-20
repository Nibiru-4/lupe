import { Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AggregatorService } from './aggregator.service';

@ApiTags('Jobs')
@Controller('jobs')
export class AggregatorController {
  constructor(private readonly aggregatorService: AggregatorService) {}

  @Post('aggregate')
  @ApiOperation({ summary: 'Trigger manual challenger aggregation job' })
  triggerAggregation() {
    return this.aggregatorService.runAggregation('manual');
  }
}
