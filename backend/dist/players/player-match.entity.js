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
exports.PlayerMatch = void 0;
const typeorm_1 = require("typeorm");
const player_entity_1 = require("./player.entity");
let PlayerMatch = class PlayerMatch {
};
exports.PlayerMatch = PlayerMatch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], PlayerMatch.prototype, "playerId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => player_entity_1.Player, (player) => player.matches, { onDelete: 'CASCADE' }),
    (0, typeorm_1.JoinColumn)({ name: 'playerId' }),
    __metadata("design:type", player_entity_1.Player)
], PlayerMatch.prototype, "player", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], PlayerMatch.prototype, "matchId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 64 }),
    __metadata("design:type", String)
], PlayerMatch.prototype, "championName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], PlayerMatch.prototype, "win", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "kills", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "deaths", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "assists", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "queueId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PlayerMatch.prototype, "gameDuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", String)
], PlayerMatch.prototype, "gameCreation", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', array: true, default: '{}' }),
    __metadata("design:type", Array)
], PlayerMatch.prototype, "items", void 0);
exports.PlayerMatch = PlayerMatch = __decorate([
    (0, typeorm_1.Entity)('player_matches'),
    (0, typeorm_1.Index)(['playerId', 'matchId'], { unique: true })
], PlayerMatch);
//# sourceMappingURL=player-match.entity.js.map