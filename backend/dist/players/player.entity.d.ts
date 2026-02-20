import { PlayerMatch } from './player-match.entity';
export declare class Player {
    id: string;
    puuid: string;
    gameName: string;
    tagLine: string;
    summonerLevel: number | null;
    platform: string | null;
    region: string | null;
    lastSyncedAt: Date;
    matches: PlayerMatch[];
}
