import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, UpdateDateColumn,
  ManyToOne, OneToMany, JoinColumn,
} from 'typeorm';
import { Filiere } from './Filiere';
import { EtudiantProfil } from './EtudiantProfil';

@Entity('classes')
export class Classe {
@PrimaryGeneratedColumn({ type: 'int', unsigned: true })
  id!: number;

  @Column({ type: 'varchar', length: 50 })
  nom!: string;

  @Column({ type: 'boolean', default: true })
  isActive!: boolean;

  // ─── Relations ────────────────────────────────────────────────────────────

  @Column({ type: 'int', unsigned: true })
  filiereId!: number;

  @ManyToOne(() => Filiere, (filiere) => filiere.classes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'filiereId' })
  filiere!: Filiere;

  @OneToMany(() => EtudiantProfil, (profil) => profil.classe)
  etudiantProfils!: EtudiantProfil[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ type: 'varchar', length: 20, unique: true, nullable: true })
  codeInscription!: string | null;
}