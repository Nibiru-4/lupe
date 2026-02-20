import { Player } from './player.entity';
export declare class PlayerMatch {
    id: number;
    playerId: string;
    player: Player;
    matchId: string;
    championName: string;
    win: boolean;
    kills: number;
    deaths: number;
    assists: number;
    queueId: number;
    gameDuration: number;
    gameCreation: string;
    items: number[];
}
