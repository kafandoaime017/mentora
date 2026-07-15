import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm'
import { Ecole } from './Ecole'
import { User } from './User'
import { Filiere } from './Filiere'
import { Classe } from './Classe'

export enum AnnonceType {
    INFO = 'info',
    SONDAGE = 'sondage',
}

// Qui doit voir l'annonce/le sondage
export enum AnnonceCible {
    TOUS = 'tous',
    FILIERE = 'filiere',
    CLASSE = 'classe',
    PROFESSEURS = 'professeurs',
}

@Entity('annonces')
export class Annonce {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number

    @Column({ type: 'int', unsigned: true })
    ecole_id!: number

    @ManyToOne(() => Ecole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ecole_id' })
    ecole!: Ecole

    @Column({ type: 'int', unsigned: true })
    auteur_id!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'auteur_id' })
    auteur!: User

    @Column({ type: 'varchar', length: 255 })
    titre!: string

    @Column({ type: 'text' })
    contenu!: string

    @Column({ type: 'simple-enum', enum: AnnonceType, default: AnnonceType.INFO })
    type!: AnnonceType

    // Pertinent seulement pour les sondages : bloque l'acces tant que non repondu
    @Column({ type: 'boolean', default: false })
    obligatoire!: boolean

    // Options du sondage (tableau de libelles), null si type = info
    @Column({ type: 'json', nullable: true })
    options!: string[] | null

    @Column({ type: 'simple-enum', enum: AnnonceCible, default: AnnonceCible.TOUS })
    cible_type!: AnnonceCible

    @Column({ type: 'int', unsigned: true, nullable: true })
    cible_filiere_id!: number | null

    @ManyToOne(() => Filiere, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cible_filiere_id' })
    cible_filiere!: Filiere | null

    @Column({ type: 'int', unsigned: true, nullable: true })
    cible_classe_id!: number | null

    @ManyToOne(() => Classe, { nullable: true, onDelete: 'CASCADE' })
    @JoinColumn({ name: 'cible_classe_id' })
    cible_classe!: Classe | null

    @Column({ type: 'boolean', default: true })
    actif!: boolean

    @CreateDateColumn()
    created_at!: Date
}
