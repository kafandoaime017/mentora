// src/app/models/Invitation.ts
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm'
import { Classe } from './Classe'
import { Filiere } from './Filiere'
import { Ecole } from './Ecole'

export enum InvitationRole {
    ETUDIANT   = 'etudiant',
    PROFESSEUR = 'professeur',
    DIRECTEUR  = 'directeur',
    SUPERADMIN = 'superadmin'
}

@Entity('invitations')
export class Invitation {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number

    @Column({ type: 'varchar', length: 255 })
    email!: string

    @Column({ type: 'varchar', length: 100 })
    nom!: string

    @Column({ type: 'varchar', length: 100 })
    prenom!: string

    @Column({ type: 'varchar', length: 255, unique: true })
    token!: string

    @Column({ type: 'simple-enum', enum: InvitationRole })
    role!: InvitationRole

    // Pour etudiant seulement
    @Column({ type: 'int', unsigned: true, nullable: true })
    classeId!: number | null

    @ManyToOne(() => Classe, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'classeId' })
    classe!: Classe | null

    // Pour etudiant + professeur (absent pour un directeur, rattache a toute l'ecole)
    @Column({ type: 'int', unsigned: true, nullable: true })
    filiereId!: number | null

    @ManyToOne(() => Filiere, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'filiereId' })
    filiere!: Filiere | null

    // Absent pour un superadmin (aucune ecole rattachee)
    @Column({ type: 'int', unsigned: true, nullable: true })
    ecoleId!: number | null

    @ManyToOne(() => Ecole, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ecoleId' })
    ecole!: Ecole | null

    @Column({ type: 'boolean', default: false })
    used!: boolean

    @Column({ type: 'datetime' })
    expiresAt!: Date

    @CreateDateColumn()
    createdAt!: Date
}
