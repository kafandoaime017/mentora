import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Ecole } from './Ecole';
import { Classe } from './Classe';

@Entity('filieres')
export class Filiere {
@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 150 })
  nom!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ─── Relations ────────────────────────────────────────────────────────────

  @Column({ type: 'int', unsigned: true })
  ecoleId!: number;

  @ManyToOne(() => Ecole, (ecole) => ecole.filieres, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'ecoleId' })
  ecole!: Ecole;

  @OneToMany(() => Classe, (classe) => classe.filiere)
  classes!: Classe[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}