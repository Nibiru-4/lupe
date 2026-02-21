import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
export type RiotMatch = {
    metadata: {
        matchId: string;
    };
    info: {
        gameVersion: string;
        gameMode: string;
        queueId: number;
        gameDuration: number;
        gameCreation: number;
        participants: Array<{
            puuid: string;
            riotIdGameName?: string;
            riotIdTagline?: string;
            summonerName?: string;
            teamId: number;
            championId: number;
            championName: string;
            win: boolean;
            kills: number;
            deaths: number;
            assists: number;
            totalMinionsKilled: number;
            neutralMinionsKilled: number;
            visionScore: number;
            summoner1Id: number;
            summoner2Id: number;
            item0: number;
            item1: number;
            item2: number;
            item3: number;
            item4: number;
            item5: number;
            item6: number;
            perks?: {
                styles?: Array<{
                    style: number;
                    selections?: Array<{
                        perk: number;
                        var1: number;
                        var2: number;
                        var3: number;
                    }>;
                }>;
            };
        }>;
    };
};
type RiotAccount = {
    puuid: string;
    gameName: string;
    tagLine: string;
};
type LeagueEntry = {
    queueType: string;
    tier: string;
    rank: string;
    leaguePoints: number;
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
        profileIconId: number;
        summonerId: string;
        platform: string;
        region: string;
    }>;
    getSummonerByPuuidOnPlatform(puuid: string, platformOverride: string): Promise<{
        id: string;
        summonerLevel: number;
        profileIconId: number;
    }>;
    getLeagueEntriesBySummonerId(summonerId: string, platformOverride?: string): Promise<LeagueEntry[]>;
    getLeagueEntriesByPuuid(puuid: string, platformOverride?: string): Promise<LeagueEntry[]>;
    getMatchIdsByPuuid(puuid: string, count?: number, queueId?: number, regionOverride?: string, start?: number): Promise<string[]>;
    getMatch(matchId: string, regionOverride?: string): Promise<RiotMatch>;
    private get;
    private buildPlatformFallbackOrder;
    private buildRegionFallbackOrder;
    private buildMatchRegionFallbackOrder;
    private regionFromPlatform;
    private regionFromMatchId;
    private isNotFound;
    private sleep;
}
export {};
