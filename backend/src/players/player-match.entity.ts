import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Player } from './player.entity';

@Entity('player_matches')
@Index(['playerId', 'matchId'], { unique: true })
export class PlayerMatch {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'uuid' })
  playerId!: string;

  @ManyToOne(() => Player, (player) => player.matches, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'playerId' })
  player!: Player;

  @Column({ type: 'varchar', length: 32 })
  matchId!: string;

  @Column({ type: 'varchar', length: 64 })
  championName!: string;

  @Column({ type: 'boolean' })
  win!: boolean;

  @Column({ type: 'int' })
  kills!: number;

  @Column({ type: 'int' })
  deaths!: number;

  @Column({ type: 'int' })
  assists!: number;

  @Column({ type: 'int' })
  queueId!: number;

  @Column({ type: 'int' })
  gameDuration!: number;

  @Column({ type: 'bigint' })
  gameCreation!: string;

  @Column({ type: 'int', array: true, default: '{}' })
  items!: number[];
}
