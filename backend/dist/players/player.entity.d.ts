import { PlayerMatch } from './player-match.entity';
export declare class Player {
    id: string;
    puuid: string;
    gameName: string;
    tagLine: string;
    summonerLevel: number | null;
    profileIconId: number | null;
    rankTier: string | null;
    rankDivision: string | null;
    rankLp: number | null;
    platform: string | null;
    region: string | null;
    lastSyncedAt: Date;
    matches: PlayerMatch[];
}
