import { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ChampionStatsService } from '../champion-stats/champion-stats.service';
import { RiotService } from '../riot/riot.service';
export declare class AggregatorService implements OnModuleInit, OnModuleDestroy {
    private readonly configService;
    private readonly riotService;
    private readonly championStatsService;
    private readonly logger;
    private timer;
    private inProgress;
    constructor(configService: ConfigService, riotService: RiotService, championStatsService: ChampionStatsService);
    onModuleInit(): void;
    onModuleDestroy(): void;
    runAggregation(source?: 'cron' | 'manual'): Promise<{
        ok: boolean;
        reason?: string;
    }>;
    private extractPatch;
}
