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
exports.ChampionStatsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const champion_stats_service_1 = require("./champion-stats.service");
let ChampionStatsController = class ChampionStatsController {
    constructor(championStatsService) {
        this.championStatsService = championStatsService;
    }
    list(patch) {
        return this.championStatsService.listChampionStats(patch);
    }
    byChampionName(championName, patch) {
        return this.championStatsService.getChampionByName(championName, patch);
    }
};
exports.ChampionStatsController = ChampionStatsController;
__decorate([
    (0, common_1.Get)(),
    (0, swagger_1.ApiOperation)({ summary: 'List champion stats' }),
    (0, swagger_1.ApiQuery)({ name: 'patch', required: false, example: '15.3' }),
    __param(0, (0, common_1.Query)('patch')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], ChampionStatsController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':championName'),
    (0, swagger_1.ApiOperation)({ summary: 'Get champion stats by champion name' }),
    (0, swagger_1.ApiParam)({ name: 'championName', example: 'Ahri' }),
    (0, swagger_1.ApiQuery)({ name: 'patch', required: false, example: '15.3' }),
    __param(0, (0, common_1.Param)('championName')),
    __param(1, (0, common_1.Query)('patch')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], ChampionStatsController.prototype, "byChampionName", null);
exports.ChampionStatsController = ChampionStatsController = __decorate([
    (0, swagger_1.ApiTags)('Champion Stats'),
    (0, common_1.Controller)('stats/champions'),
    __metadata("design:paramtypes", [champion_stats_service_1.ChampionStatsService])
], ChampionStatsController);
//# sourceMappingURL=champion-stats.controller.js.map