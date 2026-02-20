import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiotService } from '../riot/riot.service';
import { SearchPlayerDto } from './dto/search-player.dto';
import { PlayerMatch } from './player-match.entity';
import { Player } from './player.entity';

@Injectable()
export class PlayersService {
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

    const player = await this.upsertPlayer(account, summoner.summonerLevel, summoner.platform, summoner.region);
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

  private async upsertPlayer(
    account: { puuid: string; gameName: string; tagLine: string },
    summonerLevel: number,
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
}
