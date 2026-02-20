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
Object.defineProperty(exports, "__esModule", { value: true });
exports.RiotService = void 0;
const axios_1 = require("@nestjs/axios");
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const axios_2 = require("axios");
const rxjs_1 = require("rxjs");
let RiotService = class RiotService {
    constructor(httpService, configService) {
        this.httpService = httpService;
        this.configService = configService;
        this.apiKey = this.configService.get('riot.apiKey', '');
        this.platform = this.configService.get('riot.platform', 'na1');
        this.region = this.configService.get('riot.region', 'americas');
        this.targetMatches = this.configService.get('riot.targetMatches', 40);
    }
    getTargetMatches() {
        return this.targetMatches;
    }
    async getChallengerPuuids() {
        const url = `https://${this.platform}.api.riotgames.com/lol/league/v4/challengerleagues/by-queue/RANKED_SOLO_5x5`;
        const response = await this.get(url);
        return response.entries
            .map((entry) => entry.puuid)
            .filter((value) => Boolean(value));
    }
    async getPuuidBySummonerId(summonerId) {
        const url = `https://${this.platform}.api.riotgames.com/lol/summoner/v4/summoners/${summonerId}`;
        const response = await this.get(url);
        return response.puuid;
    }
    async getAccountByRiotId(gameName, tagLine) {
        const encodedGameName = encodeURIComponent(gameName);
        const encodedTagLine = encodeURIComponent(tagLine);
        const regions = this.buildRegionFallbackOrder();
        let lastError;
        for (const region of regions) {
            const url = `https://${region}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodedGameName}/${encodedTagLine}`;
            try {
                return await this.get(url);
            }
            catch (error) {
                lastError = error;
                if (!this.isNotFound(error)) {
                    throw error;
                }
            }
        }
        throw lastError ?? new Error('Account not found on any region');
    }
    async getSummonerByPuuid(puuid) {
        const platforms = this.buildPlatformFallbackOrder();
        let lastError;
        for (const platform of platforms) {
            const url = `https://${platform}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
            try {
                const summoner = await this.get(url);
                return {
                    summonerLevel: summoner.summonerLevel,
                    platform,
                    region: this.regionFromPlatform(platform),
                };
            }
            catch (error) {
                lastError = error;
                if (!this.isNotFound(error)) {
                    throw error;
                }
            }
        }
        throw lastError ?? new Error('Summoner not found on any platform');
    }
    async getMatchIdsByPuuid(puuid, count = 20, queueId, regionOverride) {
        const queueParam = queueId ? `&queue=${queueId}` : '';
        const regions = this.buildMatchRegionFallbackOrder(regionOverride);
        let lastError;
        for (const region of regions) {
            const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?start=0&count=${count}${queueParam}`;
            try {
                const matchIds = await this.get(url);
                if (matchIds.length > 0) {
                    return matchIds;
                }
            }
            catch (error) {
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
    async getMatch(matchId, regionOverride) {
        const guessedRegion = this.regionFromMatchId(matchId);
        const regions = this.buildMatchRegionFallbackOrder(regionOverride ?? guessedRegion);
        let lastError;
        for (const region of regions) {
            const url = `https://${region}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
            try {
                return await this.get(url);
            }
            catch (error) {
                lastError = error;
                if (!this.isNotFound(error)) {
                    throw error;
                }
            }
        }
        throw lastError ?? new Error(`Match not found: ${matchId}`);
    }
    async get(url) {
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.get(url, {
            headers: {
                'X-Riot-Token': this.apiKey,
            },
        }));
        return response.data;
    }
    buildPlatformFallbackOrder() {
        const byRegion = {
            americas: ['na1', 'br1', 'la1', 'la2'],
            europe: ['euw1', 'eun1', 'tr1', 'ru'],
            asia: ['kr', 'jp1'],
        };
        const allPlatforms = ['na1', 'br1', 'la1', 'la2', 'euw1', 'eun1', 'tr1', 'ru', 'kr', 'jp1'];
        const regionalPlatforms = byRegion[this.region] ?? [];
        const ordered = [this.platform, ...regionalPlatforms, ...allPlatforms];
        return [...new Set(ordered)];
    }
    buildRegionFallbackOrder() {
        const regions = [this.region, 'americas', 'europe', 'asia'];
        return [...new Set(regions)];
    }
    buildMatchRegionFallbackOrder(preferred) {
        const regions = [preferred, this.region, 'americas', 'europe', 'asia'].filter((value) => Boolean(value));
        return [...new Set(regions)];
    }
    regionFromPlatform(platform) {
        const map = {
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
    regionFromMatchId(matchId) {
        const [platform] = matchId.split('_');
        if (!platform)
            return undefined;
        return this.regionFromPlatform(platform.toLowerCase());
    }
    isNotFound(error) {
        if (!(error instanceof axios_2.AxiosError))
            return false;
        return error.response?.status === 404;
    }
};
exports.RiotService = RiotService;
exports.RiotService = RiotService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [axios_1.HttpService,
        config_1.ConfigService])
], RiotService);
//# sourceMappingURL=riot.service.js.map