import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn, OneToMany,
} from 'typeorm';
import { Filiere } from './Filiere';

@Entity('ecoles')
export class Ecole {
@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 200, unique: true })
  nom!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ville!: string | null;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Filiere, (filiere) => filiere.ecole)
  filieres!: Filiere[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}