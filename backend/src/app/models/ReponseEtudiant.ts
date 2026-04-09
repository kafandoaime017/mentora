import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Session } from './Session';
import { User } from './User';
import { Question } from './Question';

@Entity('reponses_etudiants')
export class ReponseEtudiant {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true })
    session_id!: number;

    @Column({ type: 'int', unsigned: true })
    etudiant_id!: number;

    @Column({ type: 'int', unsigned: true })
    question_id!: number;

    @Column({ type: 'json', nullable: true })
    reponse_ids!: number[];

    @Column({ type: 'boolean', default: false })
    est_correcte!: boolean;

    @CreateDateColumn()
    submitted_at!: Date;

    @ManyToOne(() => Session, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: Session;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'etudiant_id' })
    etudiant!: User;

    @ManyToOne(() => Question, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'question_id' })
    question!: Question;
}