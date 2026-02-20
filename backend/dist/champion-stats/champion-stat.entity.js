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
exports.ChampionStat = void 0;
const typeorm_1 = require("typeorm");
let ChampionStat = class ChampionStat {
};
exports.ChampionStat = ChampionStat;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ChampionStat.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], ChampionStat.prototype, "patch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ChampionStat.prototype, "championId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], ChampionStat.prototype, "championName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChampionStat.prototype, "games", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ChampionStat.prototype, "wins", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ChampionStat.prototype, "pickRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'float', default: 0 }),
    __metadata("design:type", Number)
], ChampionStat.prototype, "winRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: () => "'[]'" }),
    __metadata("design:type", Array)
], ChampionStat.prototype, "topBuilds", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], ChampionStat.prototype, "updatedAt", void 0);
exports.ChampionStat = ChampionStat = __decorate([
    (0, typeorm_1.Entity)('champion_stats'),
    (0, typeorm_1.Index)(['patch', 'championId'], { unique: true })
], ChampionStat);
//# sourceMappingURL=champion-stat.entity.js.map