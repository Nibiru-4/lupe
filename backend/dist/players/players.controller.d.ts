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
    getMatchDetail(playerId: string, matchId: string): Promise<{
        matchId: string;
        gameCreation: string;
        gameDuration: number;
        queueId: number;
        gameMode: string;
        patch: string;
        player: {
            puuid: string;
            isPlayer: boolean;
            teamId: number;
            riotIdGameName: string | null;
            riotIdTagline: string | null;
            summonerName: string | null;
            championName: string;
            championId: number;
            win: boolean;
            kills: number;
            deaths: number;
            assists: number;
            cs: number;
            visionScore: number;
            summoner1Id: number;
            summoner2Id: number;
            primaryRuneId: number | null;
            primaryStyleId: number | null;
            secondaryStyleId: number | null;
            rankTier: string | null;
            rankDivision: string | null;
            rankLp: number | null;
            items: number[];
        };
        teams: {
            teamId: number;
            win: boolean;
            participants: {
                puuid: string;
                isPlayer: boolean;
                teamId: number;
                riotIdGameName: string | null;
                riotIdTagline: string | null;
                summonerName: string | null;
                championName: string;
                championId: number;
                win: boolean;
                kills: number;
                deaths: number;
                assists: number;
                cs: number;
                visionScore: number;
                summoner1Id: number;
                summoner2Id: number;
                primaryRuneId: number | null;
                primaryStyleId: number | null;
                secondaryStyleId: number | null;
                rankTier: string | null;
                rankDivision: string | null;
                rankLp: number | null;
                items: number[];
            }[];
        }[];
    }>;
}
