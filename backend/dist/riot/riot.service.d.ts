import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
type RiotMatch = {
    metadata: {
        matchId: string;
    };
    info: {
        gameVersion: string;
        queueId: number;
        gameDuration: number;
        gameCreation: number;
        participants: Array<{
            puuid: string;
            championId: number;
            championName: string;
            win: boolean;
            kills: number;
            deaths: number;
            assists: number;
            item0: number;
            item1: number;
            item2: number;
            item3: number;
            item4: number;
            item5: number;
        }>;
    };
};
type RiotAccount = {
    puuid: string;
    gameName: string;
    tagLine: string;
};
export declare class RiotService {
    private readonly httpService;
    private readonly configService;
    private readonly apiKey;
    private readonly platform;
    private readonly region;
    private readonly targetMatches;
    constructor(httpService: HttpService, configService: ConfigService);
    getTargetMatches(): number;
    getChallengerPuuids(): Promise<string[]>;
    getPuuidBySummonerId(summonerId: string): Promise<string>;
    getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount>;
    getSummonerByPuuid(puuid: string): Promise<{
        summonerLevel: number;
        platform: string;
        region: string;
    }>;
    getMatchIdsByPuuid(puuid: string, count?: number, queueId?: number, regionOverride?: string): Promise<string[]>;
    getMatch(matchId: string, regionOverride?: string): Promise<RiotMatch>;
    private get;
    private buildPlatformFallbackOrder;
    private buildRegionFallbackOrder;
    private buildMatchRegionFallbackOrder;
    private regionFromPlatform;
    private regionFromMatchId;
    private isNotFound;
}
export {};
