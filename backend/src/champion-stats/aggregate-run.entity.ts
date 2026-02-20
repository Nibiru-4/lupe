import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('aggregate_runs')
export class AggregateRun {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'varchar', length: 16 })
  patch!: string;

  @Column({ type: 'int' })
  uniqueMatches!: number;

  @Column({ type: 'int' })
  participantsSeen!: number;

  @Column({ type: 'varchar', length: 32 })
  sourceQueue!: string;

  @Column({ type: 'timestamptz', default: () => 'NOW()' })
  createdAt!: Date;
}
