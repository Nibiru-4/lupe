import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AggregateRun } from '../champion-stats/aggregate-run.entity';
import { ChampionStat } from '../champion-stats/champion-stat.entity';
import { ChampionStatsService } from '../champion-stats/champion-stats.service';
import { RiotService } from '../riot/riot.service';

type ChampionAccumulator = {
  championId: number;
  championName: string;
  games: number;
  wins: number;
  builds: Map<string, { count: number; wins: number }>;
};

@Injectable()
export class AggregatorService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AggregatorService.name);
  private timer: NodeJS.Timeout | null = null;
  private inProgress = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly riotService: RiotService,
    private readonly championStatsService: ChampionStatsService,
  ) {}

  onModuleInit(): void {
    const everyMinutes = this.configService.get<number>('riot.aggregateEveryMinutes', 30);
    this.timer = setInterval(() => {
      void this.runAggregation('cron');
    }, everyMinutes * 60_000);
  }

  onModuleDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  async runAggregation(source: 'cron' | 'manual' = 'manual'): Promise<{ ok: boolean; reason?: string }> {
    if (this.inProgress) {
      return { ok: false, reason: 'Aggregation already running' };
    }

    const apiKey = this.configService.get<string>('riot.apiKey', '');
    if (!apiKey) {
      return { ok: false, reason: 'RIOT_API_KEY is missing' };
    }

    this.inProgress = true;
    try {
      const targetMatches = this.riotService.getTargetMatches();
      const puuids: string[] = [];
      const challengerPuuids = await this.riotService.getChallengerPuuids();
      puuids.push(...challengerPuuids.slice(0, 25));

      const matchIdsSet = new Set<string>();
      for (const puuid of puuids) {
        try {
          const ids = await this.riotService.getMatchIdsByPuuid(puuid, 20);
          for (const id of ids) {
            matchIdsSet.add(id);
            if (matchIdsSet.size >= targetMatches) {
              break;
            }
          }
          if (matchIdsSet.size >= targetMatches) {
            break;
          }
        } catch {
          continue;
        }
      }

      const matchIds = [...matchIdsSet].slice(0, targetMatches);
      if (matchIds.length === 0) {
        return { ok: false, reason: 'No matches collected' };
      }

      const matches = [];
      for (const matchId of matchIds) {
        try {
          matches.push(await this.riotService.getMatch(matchId));
        } catch {
          continue;
        }
      }

      if (matches.length === 0) {
        return { ok: false, reason: 'No match payload fetched' };
      }

      const patch = this.extractPatch(matches[0]?.info.gameVersion ?? 'unknown');
      const byChampion = new Map<number, ChampionAccumulator>();
      let participantsSeen = 0;

      for (const match of matches) {
        for (const p of match.info.participants) {
          participantsSeen += 1;
          const current = byChampion.get(p.championId) ?? {
            championId: p.championId,
            championName: p.championName,
            games: 0,
            wins: 0,
            builds: new Map<string, { count: number; wins: number }>(),
          };

          current.games += 1;
          if (p.win) current.wins += 1;

          const items = [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5].filter((x) => x > 0);
          const buildKey = items.join('-');
          if (buildKey) {
            const build = current.builds.get(buildKey) ?? { count: 0, wins: 0 };
            build.count += 1;
            if (p.win) build.wins += 1;
            current.builds.set(buildKey, build);
          }

          byChampion.set(p.championId, current);
        }
      }

      const stats: ChampionStat[] = [...byChampion.values()].map((c) => {
        const topBuilds = [...c.builds.entries()]
          .sort((a, b) => b[1].count - a[1].count)
          .slice(0, 3)
          .map(([key, value]) => ({
            items: key.split('-').filter(Boolean).map(Number),
            count: value.count,
            winRate: value.count > 0 ? Number(((value.wins / value.count) * 100).toFixed(2)) : 0,
          }));

        return {
          patch,
          championId: c.championId,
          championName: c.championName,
          games: c.games,
          wins: c.wins,
          pickRate: participantsSeen > 0 ? Number(((c.games / participantsSeen) * 100).toFixed(3)) : 0,
          winRate: c.games > 0 ? Number(((c.wins / c.games) * 100).toFixed(3)) : 0,
          topBuilds,
          updatedAt: new Date(),
        } as ChampionStat;
      });

      const run: Omit<AggregateRun, 'id' | 'createdAt'> = {
        patch,
        uniqueMatches: matches.length,
        participantsSeen,
        sourceQueue: 'RANKED_SOLO_5x5',
      };

      await this.championStatsService.saveAggregatedStats(patch, stats, run);
      this.logger.log(`Aggregation completed from ${source}: ${matches.length} matches, patch ${patch}`);
      return { ok: true };
    } finally {
      this.inProgress = false;
    }
  }

  private extractPatch(version: string): string {
    const parts = version.split('.');
    if (parts.length < 2) return version;
    return `${parts[0]}.${parts[1]}`;
  }
}
