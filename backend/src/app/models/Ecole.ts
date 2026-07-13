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

  @Column({ type: 'varchar', length: 500, nullable: true })
  adresse!: string | null;

  @Column({ type: 'varchar', length: 30, nullable: true })
  telephone!: string | null;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  @OneToMany(() => Filiere, (filiere) => filiere.ecole)
  filieres!: Filiere[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'enum', enum: ['gratuit', 'starter', 'pro'], default: 'gratuit' })
plan!: 'gratuit' | 'starter' | 'pro'

@Column({ type: 'datetime', nullable: true })
plan_expire_at!: Date | null

@Column({ type: 'varchar', length: 255, nullable: true })
stripe_customer_id!: string | null

@Column({ type: 'varchar', length: 255, nullable: true })
stripe_subscription_id!: string | null
}