import { Module } from '@nestjs/common';
import { ChampionStatsModule } from '../champion-stats/champion-stats.module';
import { RiotModule } from '../riot/riot.module';
import { AggregatorController } from './aggregator.controller';
import { AggregatorService } from './aggregator.service';

@Module({
  imports: [RiotModule, ChampionStatsModule],
  controllers: [AggregatorController],
  providers: [AggregatorService],
  exports: [AggregatorService],
})
export class AggregatorModule {}
