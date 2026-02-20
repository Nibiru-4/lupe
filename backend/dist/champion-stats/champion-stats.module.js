"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChampionStatsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const aggregate_run_entity_1 = require("./aggregate-run.entity");
const champion_stat_entity_1 = require("./champion-stat.entity");
const champion_stats_controller_1 = require("./champion-stats.controller");
const champion_stats_service_1 = require("./champion-stats.service");
let ChampionStatsModule = class ChampionStatsModule {
};
exports.ChampionStatsModule = ChampionStatsModule;
exports.ChampionStatsModule = ChampionStatsModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([champion_stat_entity_1.ChampionStat, aggregate_run_entity_1.AggregateRun])],
        controllers: [champion_stats_controller_1.ChampionStatsController],
        providers: [champion_stats_service_1.ChampionStatsService],
        exports: [champion_stats_service_1.ChampionStatsService],
    })
], ChampionStatsModule);
//# sourceMappingURL=champion-stats.module.js.map