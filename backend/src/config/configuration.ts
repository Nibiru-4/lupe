export default () => ({
  port: Number(process.env.PORT ?? 3001),
  db: {
    host: process.env.DB_HOST ?? "localhost",
    port: Number(process.env.DB_PORT ?? 5432),
    username: process.env.DB_USERNAME ?? process.env.USER ?? "",
    password: process.env.DB_PASSWORD ?? "",
    name: process.env.DB_NAME ?? "lupe",
    synchronize: (process.env.DB_SYNCHRONIZE ?? "true") === "true",
  },
  riot: {
    apiKey: process.env.RIOT_API_KEY ?? "",
    platform: process.env.RIOT_PLATFORM ?? "na1",
    region: process.env.RIOT_REGION ?? "americas",
    targetMatches: Number(process.env.TARGET_MATCHES ?? 300),
    maxGamesPerChampion: Number(process.env.MAX_GAMES_PER_CHAMPION ?? 30),
    aggregateEveryMinutes: Number(process.env.AGGREGATE_EVERY_MINUTES ?? 30),
  },
});
