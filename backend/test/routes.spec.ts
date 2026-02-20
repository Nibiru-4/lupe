import { Test } from '@nestjs/testing';
import { AggregatorController } from '../src/aggregator/aggregator.controller';
import { AggregatorService } from '../src/aggregator/aggregator.service';
import { ChampionStatsController } from '../src/champion-stats/champion-stats.controller';
import { ChampionStatsService } from '../src/champion-stats/champion-stats.service';
import { HealthController } from '../src/health.controller';

describe('Routes (controller-level)', () => {
  let healthController: HealthController;
  let championStatsController: ChampionStatsController;
  let aggregatorController: AggregatorController;

  const championStatsServiceMock = {
    listChampionStats: jest.fn(),
    getChampionByName: jest.fn(),
  };

  const aggregatorServiceMock = {
    runAggregation: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, ChampionStatsController, AggregatorController],
      providers: [
        {
          provide: ChampionStatsService,
          useValue: championStatsServiceMock,
        },
        {
          provide: AggregatorService,
          useValue: aggregatorServiceMock,
        },
      ],
    }).compile();

    healthController = moduleRef.get(HealthController);
    championStatsController = moduleRef.get(ChampionStatsController);
    aggregatorController = moduleRef.get(AggregatorController);
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('GET /health returns service status', () => {
    expect(healthController.check()).toEqual({
      ok: true,
      service: 'lupe-backend',
    });
  });

  it('GET /stats/champions forwards patch query', async () => {
    championStatsServiceMock.listChampionStats.mockResolvedValueOnce([
      { championName: 'Ahri', winRate: 51.2 },
    ]);

    const result = await championStatsController.list('15.3');

    expect(championStatsServiceMock.listChampionStats).toHaveBeenCalledWith('15.3');
    expect(result).toEqual([{ championName: 'Ahri', winRate: 51.2 }]);
  });

  it('GET /stats/champions/:championName forwards params', async () => {
    championStatsServiceMock.getChampionByName.mockResolvedValueOnce({
      championName: 'Yasuo',
      winRate: 49.9,
    });

    const result = await championStatsController.byChampionName('Yasuo', '15.3');

    expect(championStatsServiceMock.getChampionByName).toHaveBeenCalledWith(
      'Yasuo',
      '15.3',
    );
    expect(result).toEqual({ championName: 'Yasuo', winRate: 49.9 });
  });

  it('POST /jobs/aggregate triggers manual aggregation', async () => {
    aggregatorServiceMock.runAggregation.mockResolvedValueOnce({ ok: true });

    const result = await aggregatorController.triggerAggregation();

    expect(aggregatorServiceMock.runAggregation).toHaveBeenCalledWith('manual');
    expect(result).toEqual({ ok: true });
  });
});
