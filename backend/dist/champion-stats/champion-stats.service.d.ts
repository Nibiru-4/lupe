import { Repository } from 'typeorm';
import { AggregateRun } from './aggregate-run.entity';
import { ChampionStat } from './champion-stat.entity';
export declare class ChampionStatsService {
    private readonly championStatsRepo;
    private readonly aggregateRunRepo;
    constructor(championStatsRepo: Repository<ChampionStat>, aggregateRunRepo: Repository<AggregateRun>);
    listChampionStats(patch?: string): Promise<ChampionStat[]>;
    getChampionByName(name: string, patch?: string): Promise<ChampionStat | null>;
    saveAggregatedStats(patch: string, stats: ChampionStat[], run: Omit<AggregateRun, 'id' | 'createdAt'>): Promise<void>;
}
