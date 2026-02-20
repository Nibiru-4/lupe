import { ChampionStatsService } from './champion-stats.service';
export declare class ChampionStatsController {
    private readonly championStatsService;
    constructor(championStatsService: ChampionStatsService);
    list(patch?: string): Promise<import("./champion-stat.entity").ChampionStat[]>;
    byChampionName(championName: string, patch?: string): Promise<import("./champion-stat.entity").ChampionStat | null>;
}
