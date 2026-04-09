import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Session } from './Session';

export enum QuestionType {
    QCM = 'qcm',
    QCM_MULTIPLE = 'qcm_multiple',
    VRAI_FAUX = 'vrai_faux'
}

@Entity('questions')
export class Question {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true })
    session_id!: number;

    @Column({ type: 'text' })
    texte!: string;

    @Column({ type: 'enum', enum: QuestionType, default: QuestionType.QCM })
    type!: QuestionType;

    @Column({ type: 'int', default: 1 })
    points!: number;

    @Column({ type: 'int' })
    ordre!: number;

    @Column({ type: 'json', nullable: true })
    options!: string[];

    @Column({ type: 'json', nullable: true })
    reponses_correctes!: number[];

    @ManyToOne(() => Session, (session) => session.questions, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: Session;

    @CreateDateColumn()
    created_at!: Date;
}