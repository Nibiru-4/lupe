export declare class ChampionStat {
    id: number;
    patch: string;
    championId: number;
    championName: string;
    games: number;
    wins: number;
    pickRate: number;
    winRate: number;
    topBuilds: Array<{
        items: number[];
        count: number;
        winRate: number;
    }>;
    updatedAt: Date;
}
