import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('champion_stats')
@Index(['patch', 'championId'], { unique: true })
export class ChampionStat {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 16 })
  patch!: string;

  @Column({ type: 'int' })
  championId!: number;

  @Column({ type: 'varchar', length: 64 })
  championName!: string;

  @Column({ type: 'int', default: 0 })
  games!: number;

  @Column({ type: 'int', default: 0 })
  wins!: number;

  @Column({ type: 'float', default: 0 })
  pickRate!: number;

  @Column({ type: 'float', default: 0 })
  winRate!: number;

  @Column({ type: 'jsonb', default: () => "'[]'" })
  topBuilds!: Array<{ items: number[]; count: number; winRate: number }>;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  updatedAt!: Date;
}
