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
exports.AggregateRun = void 0;
const typeorm_1 = require("typeorm");
let AggregateRun = class AggregateRun {
};
exports.AggregateRun = AggregateRun;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], AggregateRun.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 16 }),
    __metadata("design:type", String)
], AggregateRun.prototype, "patch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AggregateRun.prototype, "uniqueMatches", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], AggregateRun.prototype, "participantsSeen", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 32 }),
    __metadata("design:type", String)
], AggregateRun.prototype, "sourceQueue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamptz', default: () => 'NOW()' }),
    __metadata("design:type", Date)
], AggregateRun.prototype, "createdAt", void 0);
exports.AggregateRun = AggregateRun = __decorate([
    (0, typeorm_1.Entity)('aggregate_runs')
], AggregateRun);
//# sourceMappingURL=aggregate-run.entity.js.map