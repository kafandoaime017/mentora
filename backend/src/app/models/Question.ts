import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Session } from './Session';

export enum QuestionType {
    QCM = 'qcm',
    QCM_MULTIPLE = 'qcm_multiple',
    VRAI_FAUX = 'vrai_faux',
    TEXTE_LIBRE = 'texte_libre',
    APPARIEMENT = 'appariement',
    FICHIER = 'fichier'
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true })
    session_id!: number;

    @Column({ type: 'text' })
    texte!: string;

    @Column({ type: 'simple-enum', enum: QuestionType, default: QuestionType.QCM })
    type!: QuestionType;

    @Column({ type: 'int', default: 1 })
    points!: number;

    @Column({ type: 'int' })
    ordre!: number;

    // string[] pour qcm/qcm_multiple/vrai_faux ; { gauche: string[], droite: string[] } pour appariement
    @Column({ type: 'json', nullable: true })
    options!: any;

    @Column({ type: 'json', nullable: true })
    reponses_correctes!: number[];

    // Repere indicatif pour le professeur lors de la correction manuelle
    // d'une question de type texte_libre (n'est jamais compare automatiquement).
    @Column({ type: 'text', nullable: true })
    reponse_indicative!: string | null;

    @ManyToOne(() => Session, (session) => session.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: Session;

    @CreateDateColumn()
    created_at!: Date;
}
