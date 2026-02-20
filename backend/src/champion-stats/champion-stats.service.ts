import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AggregateRun } from './aggregate-run.entity';
import { ChampionStat } from './champion-stat.entity';

@Injectable()
export class ChampionStatsService {
  constructor(
    @InjectRepository(ChampionStat)
    private readonly championStatsRepo: Repository<ChampionStat>,
    @InjectRepository(AggregateRun)
    private readonly aggregateRunRepo: Repository<AggregateRun>,
  ) {}

  async listChampionStats(patch?: string): Promise<ChampionStat[]> {
    if (!patch) {
      return this.championStatsRepo.find({
        order: { pickRate: 'DESC', games: 'DESC' },
      });
    }
    return this.championStatsRepo.find({
      where: { patch },
      order: { pickRate: 'DESC', games: 'DESC' },
    });
  }

  async getChampionByName(name: string, patch?: string): Promise<ChampionStat | null> {
    const qb = this.championStatsRepo
      .createQueryBuilder('stat')
      .where('LOWER(stat.championName) = LOWER(:name)', { name });

    if (patch) {
      qb.andWhere('stat.patch = :patch', { patch });
    } else {
      qb.orderBy('stat.updatedAt', 'DESC');
    }

    return qb.getOne();
  }

  async saveAggregatedStats(
    patch: string,
    stats: ChampionStat[],
    run: Omit<AggregateRun, 'id' | 'createdAt'>,
  ): Promise<void> {
    await this.championStatsRepo.manager.transaction(async (manager) => {
      await manager.delete(ChampionStat, { patch });
      await manager.save(ChampionStat, stats);
      await manager.save(AggregateRun, run);
    });
  }
}
