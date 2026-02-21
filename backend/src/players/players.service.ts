import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiotService } from '../riot/riot.service';
import { SearchPlayerDto } from './dto/search-player.dto';
import { PlayerMatch } from './player-match.entity';
import { Player } from './player.entity';

@Injectable()
export class PlayersService {
  private readonly rankCache = new Map<
    string,
    { value: { tier: string; division: string; lp: number } | null; expiresAt: number }
  >();
  private readonly rankCacheTtlMs = 5 * 60 * 1000;

  constructor(
    @InjectRepository(Player)
    private readonly playersRepo: Repository<Player>,
    @InjectRepository(PlayerMatch)
    private readonly playerMatchesRepo: Repository<PlayerMatch>,
    private readonly riotService: RiotService,
  ) {}

  async searchAndSyncPlayer(input: SearchPlayerDto) {
    const account = await this.riotService.getAccountByRiotId(input.gameName, input.tagLine);
    const summoner = await this.riotService.getSummonerByPuuid(account.puuid);
    const rankInfo = await this.resolveBestRank(summoner.platform, account.puuid, summoner.summonerId);

    const player = await this.upsertPlayer(
      account,
      summoner.summonerLevel,
      summoner.profileIconId,
      rankInfo?.tier ?? null,
      rankInfo?.division ?? null,
      rankInfo?.lp ?? null,
      summoner.platform,
      summoner.region,
    );
    const sync = await this.syncRecentMatches(player, summoner.region);

    const matches = await this.getPlayerMatches(player.id);
    return { player, matches, sync };
  }

  async getPlayerMatches(playerId: string) {
    return this.playerMatchesRepo.find({
      where: { playerId },
      order: { gameCreation: 'DESC' },
      take: 40,
    });
  }

  async getMatchDetail(playerId: string, matchId: string) {
    const player = await this.getPlayerById(playerId);
    const match = await this.riotService.getMatch(matchId, player.region ?? undefined);
    const participantRankMap = await this.buildParticipantRankMap(
      match.info.participants.map((participant) => participant.puuid),
      this.platformFromMatchId(matchId) ?? player.platform ?? undefined,
    );

    const me = match.info.participants.find((participant) => participant.puuid === player.puuid);
    if (!me) {
      throw new NotFoundException('Player was not found in this match');
    }

    const teams = [100, 200].map((teamId) => {
      const participants = match.info.participants
        .filter((participant) => participant.teamId === teamId)
        .map((participant) =>
          this.mapParticipant(participant, player.puuid, participantRankMap.get(participant.puuid)),
        );

      return {
        teamId,
        win: participants.some((participant) => participant.win),
        participants,
      };
    });

    return {
      matchId: match.metadata.matchId,
      gameCreation: String(match.info.gameCreation),
      gameDuration: match.info.gameDuration,
      queueId: match.info.queueId,
      gameMode: match.info.gameMode,
      patch: this.extractPatch(match.info.gameVersion),
      player: this.mapParticipant(me, player.puuid, participantRankMap.get(me.puuid)),
      teams,
    };
  }

  private async upsertPlayer(
    account: { puuid: string; gameName: string; tagLine: string },
    summonerLevel: number,
    profileIconId: number,
    rankTier: string | null,
    rankDivision: string | null,
    rankLp: number | null,
    platform: string,
    region: string,
  ) {
    const existing = await this.playersRepo.findOne({
      where: { puuid: account.puuid },
    });

    if (existing) {
      existing.gameName = account.gameName;
      existing.tagLine = account.tagLine;
      existing.summonerLevel = summonerLevel;
      existing.profileIconId = profileIconId;
      existing.rankTier = rankTier;
      existing.rankDivision = rankDivision;
      existing.rankLp = rankLp;
      existing.platform = platform;
      existing.region = region;
      existing.lastSyncedAt = new Date();
      return this.playersRepo.save(existing);
    }

    return this.playersRepo.save({
      puuid: account.puuid,
      gameName: account.gameName,
      tagLine: account.tagLine,
      summonerLevel,
      profileIconId,
      rankTier,
      rankDivision,
      rankLp,
      platform,
      region,
      lastSyncedAt: new Date(),
    });
  }

  private async syncRecentMatches(player: Player, region: string) {
    const matchIds = await this.riotService.getMatchIdsByPuuid(player.puuid, 40, undefined, region);
    if (matchIds.length === 0) {
      return {
        requestedMatchIds: 0,
        storedNewMatches: 0,
        skippedExistingMatches: 0,
        failedMatchFetches: 0,
      };
    }

    let storedNewMatches = 0;
    let skippedExistingMatches = 0;
    let failedMatchFetches = 0;

    for (const matchId of matchIds) {
      const exists = await this.playerMatchesRepo.findOne({
        where: { playerId: player.id, matchId },
      });
      if (exists) {
        if ((exists.blueDraft?.length ?? 0) === 0 || (exists.redDraft?.length ?? 0) === 0) {
          try {
            const match = await this.riotService.getMatch(matchId, region);
            exists.blueDraft = match.info.participants
              .filter((p) => p.teamId === 100)
              .map((p) => p.championName);
            exists.redDraft = match.info.participants
              .filter((p) => p.teamId === 200)
              .map((p) => p.championName);
            await this.playerMatchesRepo.save(exists);
          } catch {
            // Ignore backfill failures for existing rows.
          }
        }
        skippedExistingMatches += 1;
        continue;
      }

      try {
        const match = await this.riotService.getMatch(matchId, region);
        const participant = match.info.participants.find((p) => p.puuid === player.puuid);
        if (!participant) continue;

        const items = [
          participant.item0,
          participant.item1,
          participant.item2,
          participant.item3,
          participant.item4,
          participant.item5,
        ].filter((item) => item > 0);

        const blueDraft = match.info.participants
          .filter((p) => p.teamId === 100)
          .map((p) => p.championName);
        const redDraft = match.info.participants
          .filter((p) => p.teamId === 200)
          .map((p) => p.championName);

        await this.playerMatchesRepo.save({
          playerId: player.id,
          matchId,
          championName: participant.championName,
          win: participant.win,
          kills: participant.kills,
          deaths: participant.deaths,
          assists: participant.assists,
          queueId: match.info.queueId,
          gameDuration: match.info.gameDuration,
          gameCreation: String(match.info.gameCreation),
          items,
          blueDraft,
          redDraft,
        });
        storedNewMatches += 1;
      } catch {
        failedMatchFetches += 1;
        continue;
      }
    }

    return {
      requestedMatchIds: matchIds.length,
      storedNewMatches,
      skippedExistingMatches,
      failedMatchFetches,
    };
  }

  async getPlayerById(playerId: string) {
    const player = await this.playersRepo.findOne({ where: { id: playerId } });
    if (!player) {
      throw new NotFoundException('Player not found');
    }
    return player;
  }

  private mapParticipant(
    participant: {
      puuid: string;
      riotIdGameName?: string;
      riotIdTagline?: string;
      summonerName?: string;
      teamId: number;
      championName: string;
      championId: number;
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
          }>;
        }>;
      };
    },
    playerPuuid: string,
    rankInfo?: { tier: string; division: string; lp: number } | null,
  ) {
    const primaryStyle = participant.perks?.styles?.[0];
    const secondaryStyle = participant.perks?.styles?.[1];

    return {
      puuid: participant.puuid,
      isPlayer: participant.puuid === playerPuuid,
      teamId: participant.teamId,
      riotIdGameName: participant.riotIdGameName ?? null,
      riotIdTagline: participant.riotIdTagline ?? null,
      summonerName: participant.summonerName ?? null,
      championName: participant.championName,
      championId: participant.championId,
      win: participant.win,
      kills: participant.kills,
      deaths: participant.deaths,
      assists: participant.assists,
      cs: participant.totalMinionsKilled + participant.neutralMinionsKilled,
      visionScore: participant.visionScore,
      summoner1Id: participant.summoner1Id,
      summoner2Id: participant.summoner2Id,
      primaryRuneId: primaryStyle?.selections?.[0]?.perk ?? null,
      primaryStyleId: primaryStyle?.style ?? null,
      secondaryStyleId: secondaryStyle?.style ?? null,
      rankTier: rankInfo?.tier ?? null,
      rankDivision: rankInfo?.division ?? null,
      rankLp: rankInfo?.lp ?? null,
      items: [
        participant.item0,
        participant.item1,
        participant.item2,
        participant.item3,
        participant.item4,
        participant.item5,
        participant.item6,
      ].filter((item) => item > 0),
    };
  }

  private extractPatch(gameVersion: string): string {
    const [major, minor] = gameVersion.split('.');
    if (!major || !minor) {
      return gameVersion;
    }
    return `${major}.${minor}`;
  }

  private async resolveBestRank(platform: string, puuid: string, summonerId?: string) {
    const cached = this.rankCache.get(puuid);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.value;
    }

    let entries: Array<{ queueType: string; tier: string; rank: string; leaguePoints: number }> = [];

    try {
      entries = await this.riotService.getLeagueEntriesByPuuid(puuid, platform);
    } catch {
      entries = [];
    }

    if (entries.length === 0 && summonerId) {
      try {
        entries = await this.riotService.getLeagueEntriesBySummonerId(summonerId, platform);
      } catch {
        entries = [];
      }
    }

    const solo = entries.find((entry) => entry.queueType === 'RANKED_SOLO_5x5');
    const flex = entries.find((entry) => entry.queueType === 'RANKED_FLEX_SR');
    const selected = solo ?? flex ?? entries[0];
    if (!selected) {
      this.rankCache.set(puuid, { value: null, expiresAt: Date.now() + this.rankCacheTtlMs });
      return null;
    }

    const rank = {
      tier: selected.tier,
      division: selected.rank,
      lp: selected.leaguePoints,
    };
    this.rankCache.set(puuid, { value: rank, expiresAt: Date.now() + this.rankCacheTtlMs });
    return rank;
  }

  private async buildParticipantRankMap(
    puuids: string[],
    platform?: string,
  ): Promise<Map<string, { tier: string; division: string; lp: number }>> {
    const uniquePuuids = [...new Set(puuids)];
    const map = new Map<string, { tier: string; division: string; lp: number }>();

    for (const puuid of uniquePuuids) {
      const resolvedPlatform = platform ?? 'na1';
      let summonerId: string | undefined;
      try {
        const summoner = await this.riotService.getSummonerByPuuidOnPlatform(puuid, resolvedPlatform);
        summonerId = summoner.id;
      } catch {
        summonerId = undefined;
      }

      const rank = await this.resolveBestRank(resolvedPlatform, puuid, summonerId);
      if (rank) {
        map.set(puuid, rank);
      }
    }

    return map;
  }

  private platformFromMatchId(matchId: string): string | undefined {
    const [prefix] = matchId.split('_');
    return prefix?.toLowerCase();
  }
}
