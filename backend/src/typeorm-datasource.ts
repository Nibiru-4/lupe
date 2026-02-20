import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { AggregateRun } from './champion-stats/aggregate-run.entity';
import { ChampionStat } from './champion-stats/champion-stat.entity';
import { PlayerMatch } from './players/player-match.entity';
import { Player } from './players/player.entity';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USERNAME ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'lupe',
  entities: [ChampionStat, AggregateRun, Player, PlayerMatch],
  migrations: ['src/migrations/*.ts'],
});
