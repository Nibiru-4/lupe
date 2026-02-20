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
exports.PlayersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const search_player_dto_1 = require("./dto/search-player.dto");
const players_service_1 = require("./players.service");
let PlayersController = class PlayersController {
    constructor(playersService) {
        this.playersService = playersService;
    }
    searchAndSync(query) {
        return this.playersService.searchAndSyncPlayer(query);
    }
    async getMatches(playerId) {
        await this.playersService.getPlayerById(playerId);
        return this.playersService.getPlayerMatches(playerId);
    }
};
exports.PlayersController = PlayersController;
__decorate([
    (0, common_1.Get)('search'),
    (0, swagger_1.ApiOperation)({ summary: 'Search player by Riot ID and sync latest match history' }),
    (0, swagger_1.ApiQuery)({ name: 'gameName', required: true, example: 'Faker' }),
    (0, swagger_1.ApiQuery)({ name: 'tagLine', required: true, example: 'KR1' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [search_player_dto_1.SearchPlayerDto]),
    __metadata("design:returntype", void 0)
], PlayersController.prototype, "searchAndSync", null);
__decorate([
    (0, common_1.Get)(':playerId/matches'),
    (0, swagger_1.ApiOperation)({ summary: 'Get stored match history for a player' }),
    (0, swagger_1.ApiParam)({ name: 'playerId' }),
    __param(0, (0, common_1.Param)('playerId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PlayersController.prototype, "getMatches", null);
exports.PlayersController = PlayersController = __decorate([
    (0, swagger_1.ApiTags)('Players'),
    (0, common_1.Controller)('players'),
    __metadata("design:paramtypes", [players_service_1.PlayersService])
], PlayersController);
//# sourceMappingURL=players.controller.js.map