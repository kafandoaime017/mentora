import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn
} from 'typeorm';
import { User } from './User';
import { Classe } from './Classe';
import { Filiere } from './Filiere';
import { Question } from './Question';
import { SessionParticipant } from './SessionParticipant';

export enum SessionStatus {
    DRAFT = 'draft',
    PENDING = 'pending',
    ACTIVE = 'active',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled'
}

@Entity('sessions')
export class Session {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'varchar', length: 255 })
    titre!: string;

    @Column({ type: 'text', nullable: true })
    description!: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    theme!: string;

    @Column({ type: 'varchar', length: 10, unique: true })
    code!: string;

    @Column({ type: 'text', nullable: true })
    qr_code!: string;

    @Column({ type: 'datetime' })
    date_debut!: Date;

    @Column({ type: 'datetime' })
    date_fin!: Date;

    @Column({ type: 'int' })
    duree!: number;

    // Cles etrangeres
    @Column({ type: 'int', unsigned: true })
    classe_id!: number;

    @Column({ type: 'int', unsigned: true })
    filiere_id!: number;

    @Column({ type: 'int', unsigned: true })
    created_by!: number;

    @Column({ type: 'simple-enum', enum: SessionStatus, default: SessionStatus.DRAFT })
    status!: SessionStatus;

    // Relations
    @ManyToOne(() => Classe)
    @JoinColumn({ name: 'classe_id' })
    classe!: Classe;

    @ManyToOne(() => Filiere)
    @JoinColumn({ name: 'filiere_id' })
    filiere!: Filiere;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'created_by' })
    professeur!: User;

    @OneToMany(() => Question, (question) => question.session, { cascade: true })
    questions!: Question[];

    @OneToMany(() => SessionParticipant, (participant) => participant.session)
    participants!: SessionParticipant[];

    @CreateDateColumn()
    created_at!: Date;

    @UpdateDateColumn()
    updated_at!: Date;

  @Column({ name: 'resultats_visibles', type: 'tinyint', default: 0 })
resultatsVisibles!: boolean
}
