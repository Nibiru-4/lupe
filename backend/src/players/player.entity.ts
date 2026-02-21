import { Column, Entity, Index, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PlayerMatch } from './player-match.entity';

@Entity('players')
@Index(['puuid'], { unique: true })
@Index(['gameName', 'tagLine'])
export class Player {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 128 })
  puuid!: string;

  @Column({ type: 'varchar', length: 64 })
  gameName!: string;

  @Column({ type: 'varchar', length: 32 })
  tagLine!: string;

  @Column({ type: 'int', nullable: true })
  summonerLevel!: number | null;

  @Column({ type: 'int', nullable: true })
  profileIconId!: number | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  rankTier!: string | null;

  @Column({ type: 'varchar', length: 8, nullable: true })
  rankDivision!: string | null;

  @Column({ type: 'int', nullable: true })
  rankLp!: number | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  platform!: string | null;

  @Column({ type: 'varchar', length: 16, nullable: true })
  region!: string | null;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  lastSyncedAt!: Date;

  @OneToMany(() => PlayerMatch, (playerMatch) => playerMatch.player)
  matches!: PlayerMatch[];
}
