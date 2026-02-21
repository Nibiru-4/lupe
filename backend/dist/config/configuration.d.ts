declare const _default: () => {
    port: number;
    db: {
        host: string;
        port: number;
        username: string;
        password: string;
        name: string;
        synchronize: boolean;
    };
    riot: {
        apiKey: string;
        platform: string;
        region: string;
        targetMatches: number;
        maxGamesPerChampion: number;
        aggregateEveryMinutes: number;
    };
};
export default _default;
