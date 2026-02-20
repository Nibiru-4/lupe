"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const aggregator_module_1 = require("./aggregator/aggregator.module");
const aggregate_run_entity_1 = require("./champion-stats/aggregate-run.entity");
const champion_stat_entity_1 = require("./champion-stats/champion-stat.entity");
const champion_stats_module_1 = require("./champion-stats/champion-stats.module");
const configuration_1 = __importDefault(require("./config/configuration"));
const health_controller_1 = require("./health.controller");
const player_match_entity_1 = require("./players/player-match.entity");
const player_entity_1 = require("./players/player.entity");
const players_module_1 = require("./players/players.module");
const riot_module_1 = require("./riot/riot.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                load: [configuration_1.default],
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                inject: [config_1.ConfigService],
                useFactory: (config) => ({
                    type: 'postgres',
                    host: config.get('db.host'),
                    port: config.get('db.port'),
                    username: config.get('db.username'),
                    password: config.get('db.password'),
                    database: config.get('db.name'),
                    autoLoadEntities: true,
                    synchronize: config.get('db.synchronize', false),
                    entities: [champion_stat_entity_1.ChampionStat, aggregate_run_entity_1.AggregateRun, player_entity_1.Player, player_match_entity_1.PlayerMatch],
                }),
            }),
            riot_module_1.RiotModule,
            champion_stats_module_1.ChampionStatsModule,
            players_module_1.PlayersModule,
            aggregator_module_1.AggregatorModule,
        ],
        controllers: [health_controller_1.HealthController],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map