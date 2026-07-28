import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm'
import { Annonce } from './Annonce'
import { User } from './User'

// Une ligne par (annonce, utilisateur ciblé) : suit si l'utilisateur a vu
// l'annonce et/ou répondu au sondage.
@Entity('annonce_interactions')
export class AnnonceInteraction {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number

    @Column({ type: 'int', unsigned: true })
    annonce_id!: number

    @ManyToOne(() => Annonce, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'annonce_id' })
    annonce!: Annonce

    @Column({ type: 'int', unsigned: true })
    user_id!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'user_id' })
    user!: User

    @Column({ type: 'boolean', default: false })
    vue!: boolean

    @Column({ type: 'datetime', nullable: true })
    vue_at!: Date | null

    @Column({ type: 'int', nullable: true })
    option_choisie!: number | null

    @Column({ type: 'datetime', nullable: true })
    repondu_at!: Date | null

    @CreateDateColumn()
    created_at!: Date
}
