import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn,
    OneToOne, ManyToOne, JoinColumn,
} from 'typeorm';
import { EtudiantProfil } from './EtudiantProfil';
import { ProfesseurProfil } from './ProfesseurProfil';
import { Ecole } from './Ecole';

export enum UserRole {
    ETUDIANT   = 'etudiant',
    PROFESSEUR = 'professeur',
    DIRECTEUR  = 'directeur',
    SUPERADMIN = 'superadmin',
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

    @Column({ type: 'simple-enum', enum: UserRole })
    role!: UserRole;

    @Column({ type: 'varchar', length: 255, nullable: true, unique: true })
    googleId!: string | null;

    @Column({ type: 'varchar', length: 500, nullable: true })
    avatar!: string | null;

    @Column({ type: 'boolean', default: false })
    isVerified!: boolean;

    @Column({ type: 'boolean', default: true })
    isActive!: boolean;

    @Column({ type: 'varchar', length: 6, nullable: true })
    verificationCode!: string | null;

    @Column({ type: 'datetime', nullable: true })
    verificationCodeExpires!: Date | null;

    @Column({ type: 'varchar', length: 255, nullable: true })
    resetPasswordToken!: string | null;

    @Column({ type: 'datetime', nullable: true })
    resetPasswordExpires!: Date | null;

    // --- Ecole (pour le directeur) ---
    @Column({ type: 'int', unsigned: true, nullable: true })
    ecoleId!: number | null;

    @ManyToOne(() => Ecole, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ecoleId' })
    ecole!: Ecole | null;
    // ---

    @OneToOne(() => EtudiantProfil, (p) => p.user, { nullable: true, cascade: true })
    etudiantProfil!: EtudiantProfil | null;

    @OneToOne(() => ProfesseurProfil, (p) => p.user, { nullable: true, cascade: true })
    professeurProfil!: ProfesseurProfil | null;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @Column({ type: 'boolean', default: false })
    totpEnabled!: boolean

    @Column({ type: 'varchar', length: 255, nullable: true })
    totpSecret!: string | null

    @Column({ name: 'notif_nouvelle_session', type: 'tinyint', default: 1 })
    notifNouvelleSession!: boolean

    @Column({ name: 'notif_session_demarree', type: 'tinyint', default: 1 })
    notifSessionDemarree!: boolean

    @Column({ name: 'notif_notes_publiees', type: 'tinyint', default: 1 })
    notifNotesPubliees!: boolean

    // --- Son de notification (cloche en temps réel) ---
    @Column({ name: 'notif_son_actif', type: 'tinyint', default: 1 })
    notifSonActif!: boolean

    @Column({ name: 'notif_son_url', type: 'varchar', length: 500, nullable: true })
    notifSonUrl!: string | null
}
