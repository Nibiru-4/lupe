import { Test } from '@nestjs/testing';
import { AggregatorController } from '../src/aggregator/aggregator.controller';
import { AggregatorService } from '../src/aggregator/aggregator.service';
import { ChampionStatsController } from '../src/champion-stats/champion-stats.controller';
import { ChampionStatsService } from '../src/champion-stats/champion-stats.service';
import { HealthController } from '../src/health.controller';
import { PlayersController } from '../src/players/players.controller';
import { PlayersService } from '../src/players/players.service';

describe('Routes (controller-level)', () => {
  let healthController: HealthController;
  let championStatsController: ChampionStatsController;
  let aggregatorController: AggregatorController;
  let playersController: PlayersController;

  const championStatsServiceMock = {
    listChampionStats: jest.fn(),
    getChampionByName: jest.fn(),
  };

  const aggregatorServiceMock = {
    runAggregation: jest.fn(),
  };

  const playersServiceMock = {
    searchAndSyncPlayer: jest.fn(),
    getPlayerById: jest.fn(),
    getPlayerMatches: jest.fn(),
    getMatchDetail: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [HealthController, ChampionStatsController, AggregatorController, PlayersController],
      providers: [
        {
          provide: ChampionStatsService,
          useValue: championStatsServiceMock,
        },
        {
          provide: AggregatorService,
          useValue: aggregatorServiceMock,
        },
        {
          provide: PlayersService,
          useValue: playersServiceMock,
        },
      ],
    }).compile();

    healthController = moduleRef.get(HealthController);
    championStatsController = moduleRef.get(ChampionStatsController);
    aggregatorController = moduleRef.get(AggregatorController);
    playersController = moduleRef.get(PlayersController);
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

  it('GET /players/:playerId/matches forwards call to players service', async () => {
    playersServiceMock.getPlayerById.mockResolvedValueOnce({ id: 'p1' });
    playersServiceMock.getPlayerMatches.mockResolvedValueOnce([{ matchId: 'NA1_1' }]);

    const result = await playersController.getMatches('p1');

    expect(playersServiceMock.getPlayerById).toHaveBeenCalledWith('p1');
    expect(playersServiceMock.getPlayerMatches).toHaveBeenCalledWith('p1');
    expect(result).toEqual([{ matchId: 'NA1_1' }]);
  });

  it('GET /players/:playerId/matches/:matchId forwards call to players service', async () => {
    playersServiceMock.getMatchDetail.mockResolvedValueOnce({ matchId: 'NA1_1' });

    const result = await playersController.getMatchDetail('p1', 'NA1_1');

    expect(playersServiceMock.getMatchDetail).toHaveBeenCalledWith('p1', 'NA1_1');
    expect(result).toEqual({ matchId: 'NA1_1' });
  });
});
