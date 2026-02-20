"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const aggregate_run_entity_1 = require("./champion-stats/aggregate-run.entity");
const champion_stat_entity_1 = require("./champion-stats/champion-stat.entity");
const player_match_entity_1 = require("./players/player-match.entity");
const player_entity_1 = require("./players/player.entity");
exports.default = new typeorm_1.DataSource({
    type: 'postgres',
    host: process.env.DB_HOST ?? 'localhost',
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? 'postgres',
    password: process.env.DB_PASSWORD ?? 'postgres',
    database: process.env.DB_NAME ?? 'lupe',
    entities: [champion_stat_entity_1.ChampionStat, aggregate_run_entity_1.AggregateRun, player_entity_1.Player, player_match_entity_1.PlayerMatch],
    migrations: ['src/migrations/*.ts'],
});
//# sourceMappingURL=typeorm-datasource.js.map