# Lupe Backend (NestJS + TypeORM)

API backend pour agréger les stats champions (winrate, pickrate, builds) depuis les parties Challenger SoloQ.

## Stack

- NestJS
- TypeORM
- PostgreSQL
- Riot API

## Setup

1. Copier l'env:

```bash
cp .env.example .env
```

2. Installer les deps:

```bash
npm install
```

3. Démarrer:

```bash
npm run start:dev
```

API par défaut: `http://localhost:3001/api`
Swagger UI: `http://localhost:3001/api`

## Endpoints

- `GET /api/health`
- `GET /api/stats/champions?patch=15.3`
- `GET /api/stats/champions/:championName?patch=15.3`
- `POST /api/jobs/aggregate` (trigger manuel)
- `GET /api/players/search?gameName=...&tagLine=...`
- `GET /api/players/:playerId/matches`
- `GET /api/players/:playerId/matches/:matchId`

## Docker (API + Postgres)

1. Copier l'env docker:

```bash
cp .env.docker.example .env.docker
```

2. Ajouter ta vraie `RIOT_API_KEY` dans `.env.docker`.

3. Lancer les services:

```bash
docker compose up -d --build
```

4. Ouvrir l'API:

- API: `http://localhost:3001/api`
- Swagger: `http://localhost:3001/api`

## Agrégation

- Source: Challenger SoloQ (`RANKED_SOLO_5x5`)
- Fenêtre de collecte: `TARGET_MATCHES` (par défaut `300`)
- Cap par champion: `MAX_GAMES_PER_CHAMPION` (par défaut `30`)
- Recalcul auto: toutes les `AGGREGATE_EVERY_MINUTES` (par défaut `30`)

Chaque champion stocke:

- `games`
- `wins`
- `pickRate` (% sur participants retenus après cap)
- `winRate`
- `topBuilds` (top 3 builds d'items)

## Notes

- `DB_SYNCHRONIZE=true` pratique en dev, à désactiver en prod.
- Les limites de rate Riot API peuvent nécessiter un throttling plus fin selon la fréquence de cron.
