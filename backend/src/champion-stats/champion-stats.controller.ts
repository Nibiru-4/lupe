import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { ChampionStatsService } from './champion-stats.service';

@ApiTags('Champion Stats')
@Controller('stats/champions')
export class ChampionStatsController {
  constructor(private readonly championStatsService: ChampionStatsService) {}

  @Get()
  @ApiOperation({ summary: 'List champion stats' })
  @ApiQuery({ name: 'patch', required: false, example: '15.3' })
  list(@Query('patch') patch?: string) {
    return this.championStatsService.listChampionStats(patch);
  }

  @Get(':championName')
  @ApiOperation({ summary: 'Get champion stats by champion name' })
  @ApiParam({ name: 'championName', example: 'Ahri' })
  @ApiQuery({ name: 'patch', required: false, example: '15.3' })
  byChampionName(
    @Param('championName') championName: string,
    @Query('patch') patch?: string,
  ) {
    return this.championStatsService.getChampionByName(championName, patch);
  }
}
