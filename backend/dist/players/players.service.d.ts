import { Repository } from 'typeorm';
import { RiotService } from '../riot/riot.service';
import { SearchPlayerDto } from './dto/search-player.dto';
import { PlayerMatch } from './player-match.entity';
import { Player } from './player.entity';
export declare class PlayersService {
    private readonly playersRepo;
    private readonly playerMatchesRepo;
    private readonly riotService;
    constructor(playersRepo: Repository<Player>, playerMatchesRepo: Repository<PlayerMatch>, riotService: RiotService);
    searchAndSyncPlayer(input: SearchPlayerDto): Promise<{
        player: Player;
        matches: PlayerMatch[];
        sync: {
            requestedMatchIds: number;
            storedNewMatches: number;
            skippedExistingMatches: number;
            failedMatchFetches: number;
        };
    }>;
    getPlayerMatches(playerId: string): Promise<PlayerMatch[]>;
    private upsertPlayer;
    private syncRecentMatches;
    getPlayerById(playerId: string): Promise<Player>;
}
