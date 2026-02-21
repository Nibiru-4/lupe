import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { SearchPlayerDto } from './dto/search-player.dto';
import { PlayersService } from './players.service';

@ApiTags('Players')
@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get('search')
  @ApiOperation({ summary: 'Search player by Riot ID and sync latest match history' })
  @ApiQuery({ name: 'gameName', required: true, example: 'Faker' })
  @ApiQuery({ name: 'tagLine', required: true, example: 'KR1' })
  searchAndSync(@Query() query: SearchPlayerDto) {
    return this.playersService.searchAndSyncPlayer(query);
  }

  @Get(':playerId/matches')
  @ApiOperation({ summary: 'Get stored match history for a player' })
  @ApiParam({ name: 'playerId' })
  async getMatches(@Param('playerId') playerId: string) {
    await this.playersService.getPlayerById(playerId);
    return this.playersService.getPlayerMatches(playerId);
  }

  @Get(':playerId/matches/:matchId')
  @ApiOperation({ summary: 'Get a full match detail for a player match' })
  @ApiParam({ name: 'playerId' })
  @ApiParam({ name: 'matchId' })
  getMatchDetail(@Param('playerId') playerId: string, @Param('matchId') matchId: string) {
    return this.playersService.getMatchDetail(playerId, matchId);
  }
}
