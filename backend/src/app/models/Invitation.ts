// src/app/models/Invitation.ts
import {
    Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm'
import { Classe } from './Classe'
import { Filiere } from './Filiere'
import { Ecole } from './Ecole'

export enum InvitationRole {
    ETUDIANT   = 'etudiant',
    PROFESSEUR = 'professeur'
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

    @Column({ type: 'enum', enum: InvitationRole })
    role!: InvitationRole

    // Pour étudiant seulement
    @Column({ type: 'int', unsigned: true, nullable: true })
    classeId!: number | null

    @ManyToOne(() => Classe, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'classeId' })
    classe!: Classe | null

    // Pour étudiant + professeur
    @Column({ type: 'int', unsigned: true })
    filiereId!: number

    @ManyToOne(() => Filiere, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'filiereId' })
    filiere!: Filiere

    @Column({ type: 'int', unsigned: true })
    ecoleId!: number

    @ManyToOne(() => Ecole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ecoleId' })
    ecole!: Ecole

    @Column({ type: 'boolean', default: false })
    used!: boolean

    @Column({ type: 'datetime' })
    expiresAt!: Date

    @CreateDateColumn()
    createdAt!: Date
}


