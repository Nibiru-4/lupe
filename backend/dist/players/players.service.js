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
        this.rankCache = new Map();
        this.rankCacheTtlMs = 5 * 60 * 1000;
    }
    async searchAndSyncPlayer(input) {
        const account = await this.riotService.getAccountByRiotId(input.gameName, input.tagLine);
        const summoner = await this.riotService.getSummonerByPuuid(account.puuid);
        const rankInfo = await this.resolveBestRank(summoner.platform, account.puuid, summoner.summonerId);
        const player = await this.upsertPlayer(account, summoner.summonerLevel, summoner.profileIconId, rankInfo?.tier ?? null, rankInfo?.division ?? null, rankInfo?.lp ?? null, summoner.platform, summoner.region);
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
    async getMatchDetail(playerId, matchId) {
        const player = await this.getPlayerById(playerId);
        const match = await this.riotService.getMatch(matchId, player.region ?? undefined);
        const participantRankMap = await this.buildParticipantRankMap(match.info.participants.map((participant) => participant.puuid), this.platformFromMatchId(matchId) ?? player.platform ?? undefined);
        const me = match.info.participants.find((participant) => participant.puuid === player.puuid);
        if (!me) {
            throw new common_1.NotFoundException('Player was not found in this match');
        }
        const teams = [100, 200].map((teamId) => {
            const participants = match.info.participants
                .filter((participant) => participant.teamId === teamId)
                .map((participant) => this.mapParticipant(participant, player.puuid, participantRankMap.get(participant.puuid)));
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
    async upsertPlayer(account, summonerLevel, profileIconId, rankTier, rankDivision, rankLp, platform, region) {
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
                    }
                    catch {
                    }
                }
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
    mapParticipant(participant, playerPuuid, rankInfo) {
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
    extractPatch(gameVersion) {
        const [major, minor] = gameVersion.split('.');
        if (!major || !minor) {
            return gameVersion;
        }
        return `${major}.${minor}`;
    }
    async resolveBestRank(platform, puuid, summonerId) {
        const cached = this.rankCache.get(puuid);
        if (cached && cached.expiresAt > Date.now()) {
            return cached.value;
        }
        let entries = [];
        try {
            entries = await this.riotService.getLeagueEntriesByPuuid(puuid, platform);
        }
        catch {
            entries = [];
        }
        if (entries.length === 0 && summonerId) {
            try {
                entries = await this.riotService.getLeagueEntriesBySummonerId(summonerId, platform);
            }
            catch {
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
    async buildParticipantRankMap(puuids, platform) {
        const uniquePuuids = [...new Set(puuids)];
        const map = new Map();
        for (const puuid of uniquePuuids) {
            const resolvedPlatform = platform ?? 'na1';
            let summonerId;
            try {
                const summoner = await this.riotService.getSummonerByPuuidOnPlatform(puuid, resolvedPlatform);
                summonerId = summoner.id;
            }
            catch {
                summonerId = undefined;
            }
            const rank = await this.resolveBestRank(resolvedPlatform, puuid, summonerId);
            if (rank) {
                map.set(puuid, rank);
            }
        }
        return map;
    }
    platformFromMatchId(matchId) {
        const [prefix] = matchId.split('_');
        return prefix?.toLowerCase();
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