"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlayersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const riot_service_1 = require("../riot/riot.service");
const player_match_entity_1 = require("./player-match.entity");
const player_entity_1 = require("./player.entity");
let PlayersService = class PlayersService {
    constructor(playersRepo, playerMatchesRepo, riotService) {
        this.playersRepo = playersRepo;
        this.playerMatchesRepo = playerMatchesRepo;
        this.riotService = riotService;
    }
    async searchAndSyncPlayer(input) {
        const account = await this.riotService.getAccountByRiotId(input.gameName, input.tagLine);
        const summoner = await this.riotService.getSummonerByPuuid(account.puuid);
        const player = await this.upsertPlayer(account, summoner.summonerLevel, summoner.platform, summoner.region);
        const sync = await this.syncRecentMatches(player, summoner.region);
        const matches = await this.getPlayerMatches(player.id);
        return { player, matches, sync };
    }
    async getPlayerMatches(playerId) {
        return this.playerMatchesRepo.find({
            where: { playerId },
            order: { gameCreation: 'DESC' },
            take: 40,
        });
    }
    async upsertPlayer(account, summonerLevel, platform, region) {
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
    async syncRecentMatches(player, region) {
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
                if (!participant)
                    continue;
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
            }
            catch {
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
    async getPlayerById(playerId) {
        const player = await this.playersRepo.findOne({ where: { id: playerId } });
        if (!player) {
            throw new common_1.NotFoundException('Player not found');
        }
        return player;
    }
};
exports.PlayersService = PlayersService;
exports.PlayersService = PlayersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(player_entity_1.Player)),
    __param(1, (0, typeorm_1.InjectRepository)(player_match_entity_1.PlayerMatch)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        riot_service_1.RiotService])
], PlayersService);
//# sourceMappingURL=players.service.js.map