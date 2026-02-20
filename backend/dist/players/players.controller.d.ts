import { SearchPlayerDto } from './dto/search-player.dto';
import { PlayersService } from './players.service';
export declare class PlayersController {
    private readonly playersService;
    constructor(playersService: PlayersService);
    searchAndSync(query: SearchPlayerDto): Promise<{
        player: import("./player.entity").Player;
        matches: import("./player-match.entity").PlayerMatch[];
        sync: {
            requestedMatchIds: number;
            storedNewMatches: number;
            skippedExistingMatches: number;
            failedMatchFetches: number;
        };
    }>;
    getMatches(playerId: string): Promise<import("./player-match.entity").PlayerMatch[]>;
}
