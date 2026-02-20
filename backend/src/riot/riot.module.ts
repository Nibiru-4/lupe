import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { RiotService } from './riot.service';

@Module({
  imports: [HttpModule],
  providers: [RiotService],
  exports: [RiotService],
})
export class RiotModule {}
