import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    OneToOne,
} from 'typeorm';
import { EtudiantProfil } from './EtudiantProfil';
import { ProfesseurProfil } from './ProfesseurProfil';

export enum UserRole {
    ETUDIANT    = 'etudiant',
    PROFESSEUR  = 'professeur',
    DIRECTEUR   = 'directeur',
    ADMIN       = 'admin',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 100 })
    nom!: string;

    @Column({ type: 'varchar', length: 100 })
    prenom!: string;

    @Column({ type: 'varchar', length: 255, unique: true })
    email!: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    motDePasse!: string | null;

    @Column({ type: 'enum', enum: UserRole })
    role!: UserRole;

    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    googleId!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar!: string | null;

    @Column({ type: 'boolean', default: false })
    isVerified!: boolean;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    // ═══════════════════════════════════════════════════════════
    // CHAMPS POUR LA VÉRIFICATION PAR EMAIL
    // ═══════════════════════════════════════════════════════════
    
    @Column({ type: 'varchar', length: 6, nullable: true })
    verificationCode!: string | null;

    @Column({ type: 'datetime', nullable: true })
    verificationCodeExpires!: Date | null;

    // ═══════════════════════════════════════════════════════════
    // 🆕 CHAMPS POUR LA RÉINITIALISATION DU MOT DE PASSE
    // ═══════════════════════════════════════════════════════════
    
    @Column({ type: 'varchar', length: 255, nullable: true })
    resetPasswordToken!: string | null;

    @Column({ type: 'datetime', nullable: true })
    resetPasswordExpires!: Date | null;

    // ═══════════════════════════════════════════════════════════

    @OneToOne(() => EtudiantProfil, (p) => p.user, { nullable: true, cascade: true })
    etudiantProfil!: EtudiantProfil | null;

    @OneToOne(() => ProfesseurProfil, (p) => p.user, { nullable: true, cascade: true })
    professeurProfil!: ProfesseurProfil | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}