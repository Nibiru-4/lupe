"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChampionStatsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const aggregate_run_entity_1 = require("./aggregate-run.entity");
const champion_stat_entity_1 = require("./champion-stat.entity");
let ChampionStatsService = class ChampionStatsService {
    constructor(championStatsRepo, aggregateRunRepo) {
        this.championStatsRepo = championStatsRepo;
        this.aggregateRunRepo = aggregateRunRepo;
    }
    async listChampionStats(patch) {
        if (!patch) {
            return this.championStatsRepo.find({
                order: { pickRate: 'DESC', games: 'DESC' },
            });
        }
        return this.championStatsRepo.find({
            where: { patch },
            order: { pickRate: 'DESC', games: 'DESC' },
        });
    }
    async getChampionByName(name, patch) {
        const qb = this.championStatsRepo
            .createQueryBuilder('stat')
            .where('LOWER(stat.championName) = LOWER(:name)', { name });
        if (patch) {
            qb.andWhere('stat.patch = :patch', { patch });
        }
        else {
            qb.orderBy('stat.updatedAt', 'DESC');
        }
        return qb.getOne();
    }
    async saveAggregatedStats(patch, stats, run) {
        await this.championStatsRepo.manager.transaction(async (manager) => {
            await manager.delete(champion_stat_entity_1.ChampionStat, { patch });
            await manager.save(champion_stat_entity_1.ChampionStat, stats);
            await manager.save(aggregate_run_entity_1.AggregateRun, run);
        });
    }
};
exports.ChampionStatsService = ChampionStatsService;
exports.ChampionStatsService = ChampionStatsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(champion_stat_entity_1.ChampionStat)),
    __param(1, (0, typeorm_1.InjectRepository)(aggregate_run_entity_1.AggregateRun)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], ChampionStatsService);
//# sourceMappingURL=champion-stats.service.js.map