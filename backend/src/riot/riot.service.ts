import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';

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

type ChallengerEntry = {
  puuid?: string;
  summonerId?: string;
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

@Injectable()
export class RiotService {
  private readonly apiKey: string;
  private readonly platform: string;
  private readonly region: string;
  private readonly targetMatches: number;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.apiKey = this.configService.get<string>('riot.apiKey', '');
    this.platform = this.configService.get<string>('riot.platform', 'na1');
    this.region = this.configService.get<string>('riot.region', 'americas');
    this.targetMatches = this.configService.get<number>('riot.targetMatches', 40);
  }

  getTargetMatches(): number {
    return this.targetMatches;
  }

  async getChallengerPuuids(): Promise<string[]> {
    const url = `https://${this.platform}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
    const response = await this.get<{ entries: ChallengerEntry[] }>(url);
    return response.entries
      .map((entry) => entry.puuid)
      .filter((value): value is string => Boolean(value));
  }

  async getPuuidBySummonerId(summonerId: string): Promise<string> {
    const url = `https://${this.platform}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`;
    const response = await this.get<{ puuid: string }>(url);
    return response.puuid;
  }

  async getAccountByRiotId(gameName: string, tagLine: string): Promise<RiotAccount> {
    const encodedGameName = encodeURIComponent(gameName);
    const encodedTagLine = encodeURIComponent(tagLine);
    const regions = this.buildRegionFallbackOrder();
    let lastError: unknown;

    for (const region of regions) {
      const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
      try {
        return await this.get<RiotAccount>(url);
      } catch (error) {
        lastError = error;
        if (!this.isNotFound(error)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error('Account not found on any region');
  }

  async getSummonerByPuuid(
    puuid: string,
  ): Promise<{
    summonerLevel: number;
    profileIconId: number;
    summonerId: string;
    platform: string;
    region: string;
  }> {
    const platforms = this.buildPlatformFallbackOrder();
    let lastError: unknown;

    for (const platform of platforms) {
      try {
        const summoner = await this.getSummonerByPuuidOnPlatform(puuid, platform);
        return {
          summonerLevel: summoner.summonerLevel,
          profileIconId: summoner.profileIconId,
          summonerId: summoner.id,
          platform,
          region: this.regionFromPlatform(platform),
        };
      } catch (error) {
        lastError = error;
        if (!this.isNotFound(error)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error('Summoner not found on any platform');
  }

  async getSummonerByPuuidOnPlatform(
    puuid: string,
    platformOverride: string,
  ): Promise<{ id: string; summonerLevel: number; profileIconId: number }> {
    const url = `https://${platformOverride}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
    return this.get<{ id: string; summonerLevel: number; profileIconId: number }>(url);
  }

  async getLeagueEntriesBySummonerId(
    summonerId: string,
    platformOverride?: string,
  ): Promise<LeagueEntry[]> {
    const platform = platformOverride ?? this.platform;
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-summoner/${summonerId}`;
    return this.get<LeagueEntry[]>(url);
  }

  async getLeagueEntriesByPuuid(
    puuid: string,
    platformOverride?: string,
  ): Promise<LeagueEntry[]> {
    const platform = platformOverride ?? this.platform;
    const url = `https://${platform}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
    return this.get<LeagueEntry[]>(url);
  }

  async getMatchIdsByPuuid(
    puuid: string,
    count = 20,
    queueId?: number,
    regionOverride?: string,
    start = 0,
  ): Promise<string[]> {
    const queueParam = queueId ? `&queue=${queueId}` : '';
    const regions = this.buildMatchRegionFallbackOrder(regionOverride);
    let lastError: unknown;

    for (const region of regions) {
      const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=${start}&count=${count}${queueParam}`;
      try {
        const matchIds = await this.get<string[]>(url);
        if (matchIds.length > 0) {
          return matchIds;
        }
      } catch (error) {
        lastError = error;
        if (!this.isNotFound(error)) {
          throw error;
        }
      }
    }

    if (lastError && !this.isNotFound(lastError)) {
      throw lastError;
    }
    return [];
  }

  async getMatch(matchId: string, regionOverride?: string): Promise<RiotMatch> {
    const guessedRegion = this.regionFromMatchId(matchId);
    const regions = this.buildMatchRegionFallbackOrder(regionOverride ?? guessedRegion);
    let lastError: unknown;

    for (const region of regions) {
      const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
      try {
        return await this.get<RiotMatch>(url);
      } catch (error) {
        lastError = error;
        if (!this.isNotFound(error)) {
          throw error;
        }
      }
    }

    throw lastError ?? new Error(`Match not found: ${matchId}`);
  }

  private async get<T>(url: string): Promise<T> {
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        const response = await firstValueFrom(
          this.httpService.get<T>(url, {
            headers: {
              'X-Riot-Token': this.apiKey,
            },
          }),
        );
        return response.data;
      } catch (error) {
        if (!(error instanceof AxiosError)) {
          throw error;
        }

        const status = error.response?.status;
        const retryAfterHeader = error.response?.headers?.['retry-after'];
        const retryAfterSeconds = Number(retryAfterHeader);
        const isRetriable = status === 429 || status === 503;

        if (!isRetriable || attempt === maxAttempts) {
          throw error;
        }

        const delayMs = Number.isFinite(retryAfterSeconds)
          ? Math.max(1000, retryAfterSeconds * 1000)
          : 1200 * attempt;
        await this.sleep(delayMs);
      }
    }

    throw new Error('Unexpected retry loop termination');
  }

  private buildPlatformFallbackOrder(): string[] {
    const byRegion: Record<string, string[]> = {
      americas: ['na1', 'br1', 'la1', 'la2'],
      europe: ['euw1', 'eun1', 'tr1', 'ru'],
      asia: ['kr', 'jp1'],
    };

    const allPlatforms = ['na1', 'br1', 'la1', 'la2', 'euw1', 'eun1', 'tr1', 'ru', 'kr', 'jp1'];
    const regionalPlatforms = byRegion[this.region] ?? [];

    const ordered = [this.platform, ...regionalPlatforms, ...allPlatforms];
    return [...new Set(ordered)];
  }

  private buildRegionFallbackOrder(): string[] {
    const regions = [this.region, 'americas', 'europe', 'asia'];
    return [...new Set(regions)];
  }

  private buildMatchRegionFallbackOrder(preferred?: string): string[] {
    const regions = [preferred, this.region, 'americas', 'europe', 'asia'].filter(
      (value): value is string => Boolean(value),
    );
    return [...new Set(regions)];
  }

  private regionFromPlatform(platform: string): string {
    const map: Record<string, string> = {
      na1: 'americas',
      br1: 'americas',
      la1: 'americas',
      la2: 'americas',
      euw1: 'europe',
      eun1: 'europe',
      tr1: 'europe',
      ru: 'europe',
      kr: 'asia',
      jp1: 'asia',
    };
    return map[platform] ?? this.region;
  }

  private regionFromMatchId(matchId: string): string | undefined {
    const [platform] = matchId.split('_');
    if (!platform) return undefined;
    return this.regionFromPlatform(platform.toLowerCase());
  }

  private isNotFound(error: unknown): boolean {
    if (!(error instanceof AxiosError)) return false;
    return error.response?.status === 404;
  }

  private async sleep(ms: number) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
