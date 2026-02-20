import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiotModule } from '../riot/riot.module';
import { PlayerMatch } from './player-match.entity';
import { Player } from './player.entity';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';

@Module({
  imports: [TypeOrmModule.forFeature([Player, PlayerMatch]), RiotModule],
  providers: [PlayersService],
  controllers: [PlayersController],
})
export class PlayersModule {}
