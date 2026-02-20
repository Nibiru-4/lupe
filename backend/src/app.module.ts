import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AggregatorModule } from './aggregator/aggregator.module';
import { AggregateRun } from './champion-stats/aggregate-run.entity';
import { ChampionStat } from './champion-stats/champion-stat.entity';
import { ChampionStatsModule } from './champion-stats/champion-stats.module';
import configuration from './config/configuration';
import { HealthController } from './health.controller';
import { PlayerMatch } from './players/player-match.entity';
import { Player } from './players/player.entity';
import { PlayersModule } from './players/players.module';
import { RiotModule } from './riot/riot.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('db.host'),
        port: config.get<number>('db.port'),
        username: config.get<string>('db.username'),
        password: config.get<string>('db.password'),
        database: config.get<string>('db.name'),
        autoLoadEntities: true,
        synchronize: config.get<boolean>('db.synchronize', false),
        entities: [ChampionStat, AggregateRun, Player, PlayerMatch],
      }),
    }),
    RiotModule,
    ChampionStatsModule,
    PlayersModule,
    AggregatorModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
