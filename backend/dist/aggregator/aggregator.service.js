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
var AggregatorService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AggregatorService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const champion_stats_service_1 = require("../champion-stats/champion-stats.service");
const riot_service_1 = require("../riot/riot.service");
let AggregatorService = AggregatorService_1 = class AggregatorService {
    constructor(configService, riotService, championStatsService) {
        this.configService = configService;
        this.riotService = riotService;
        this.championStatsService = championStatsService;
        this.logger = new common_1.Logger(AggregatorService_1.name);
        this.timer = null;
        this.inProgress = false;
    }
    onModuleInit() {
        const everyMinutes = this.configService.get('riot.aggregateEveryMinutes', 30);
        this.timer = setInterval(() => {
            void this.runAggregation('cron');
        }, everyMinutes * 60_000);
    }
    onModuleDestroy() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    async runAggregation(source = 'manual') {
        if (this.inProgress) {
            return { ok: false, reason: 'Aggregation already running' };
        }
        const apiKey = this.configService.get('riot.apiKey', '');
        if (!apiKey) {
            return { ok: false, reason: 'RIOT_API_KEY is missing' };
        }
        this.inProgress = true;
        try {
            const targetMatches = this.riotService.getTargetMatches();
            const puuids = [];
            const challengerPuuids = await this.riotService.getChallengerPuuids();
            puuids.push(...challengerPuuids.slice(0, 25));
            const matchIdsSet = new Set();
            for (const puuid of puuids) {
                try {
                    const ids = await this.riotService.getMatchIdsByPuuid(puuid, 20);
                    for (const id of ids) {
                        matchIdsSet.add(id);
                        if (matchIdsSet.size >= targetMatches) {
                            break;
                        }
                    }
                    if (matchIdsSet.size >= targetMatches) {
                        break;
                    }
                }
                catch {
                    continue;
                }
            }
            const matchIds = [...matchIdsSet].slice(0, targetMatches);
            if (matchIds.length === 0) {
                return { ok: false, reason: 'No matches collected' };
            }
            const matches = [];
            for (const matchId of matchIds) {
                try {
                    matches.push(await this.riotService.getMatch(matchId));
                }
                catch {
                    continue;
                }
            }
            if (matches.length === 0) {
                return { ok: false, reason: 'No match payload fetched' };
            }
            const patch = this.extractPatch(matches[0]?.info.gameVersion ?? 'unknown');
            const byChampion = new Map();
            let participantsSeen = 0;
            for (const match of matches) {
                for (const p of match.info.participants) {
                    participantsSeen += 1;
                    const current = byChampion.get(p.championId) ?? {
                        championId: p.championId,
                        championName: p.championName,
                        games: 0,
                        wins: 0,
                        builds: new Map(),
                    };
                    current.games += 1;
                    if (p.win)
                        current.wins += 1;
                    const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter((x) => x > 0);
                    const buildKey = items.join('-');
                    if (buildKey) {
                        const build = current.builds.get(buildKey) ?? { count: 0, wins: 0 };
                        build.count += 1;
                        if (p.win)
                            build.wins += 1;
                        current.builds.set(buildKey, build);
                    }
                    byChampion.set(p.championId, current);
                }
            }
            const stats = [...byChampion.values()].map((c) => {
                const topBuilds = [...c.builds.entries()]
                    .sort((a, b) => b[1].count - a[1].count)
                    .slice(0, 3)
                    .map(([key, value]) => ({
                    items: key.split('-').filter(Boolean).map(Number),
                    count: value.count,
                    winRate: value.count > 0 ? Number(((value.wins / value.count) * 100).toFixed(2)) : 0,
                }));
                return {
                    patch,
                    championId: c.championId,
                    championName: c.championName,
                    games: c.games,
                    wins: c.wins,
                    pickRate: participantsSeen > 0 ? Number(((c.games / participantsSeen) * 100).toFixed(3)) : 0,
                    winRate: c.games > 0 ? Number(((c.wins / c.games) * 100).toFixed(3)) : 0,
                    topBuilds,
                    updatedAt: new Date(),
                };
            });
            const run = {
                patch,
                uniqueMatches: matches.length,
                participantsSeen,
                sourceQueue: 'RANKED_SOLO_5x5',
            };
            await this.championStatsService.saveAggregatedStats(patch, stats, run);
            this.logger.log(`Aggregation completed from ${source}: ${matches.length} matches, patch ${patch}`);
            return { ok: true };
        }
        finally {
            this.inProgress = false;
        }
    }
    extractPatch(version) {
        const parts = version.split('.');
        if (parts.length < 2)
            return version;
        return `${parts[0]}.${parts[1]}`;
    }
};
exports.AggregatorService = AggregatorService;
exports.AggregatorService = AggregatorService = AggregatorService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService,
        riot_service_1.RiotService,
        champion_stats_service_1.ChampionStatsService])
], AggregatorService);
//# sourceMappingURL=aggregator.service.js.map