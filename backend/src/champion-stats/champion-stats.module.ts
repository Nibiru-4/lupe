import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregateRun } from './aggregate-run.entity';
import { ChampionStat } from './champion-stat.entity';
import { ChampionStatsController } from './champion-stats.controller';
import { ChampionStatsService } from './champion-stats.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChampionStat, AggregateRun])],
  controllers: [ChampionStatsController],
  providers: [ChampionStatsService],
  exports: [ChampionStatsService],
})
export class ChampionStatsModule {}
