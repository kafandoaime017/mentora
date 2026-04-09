import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Session } from './Session';
import { User } from './User';

export enum ParticipantStatus {
    INSCRIT = 'inscrit',
    PRESENT = 'present',
    ABSENT = 'absent',
    TERMINE = 'termine'
}

@Entity('session_participants')
export class SessionParticipant {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true })
    session_id!: number;

    @Column({ type: 'int', unsigned: true })
    etudiant_id!: number;

    @Column({ type: 'enum', enum: ParticipantStatus, default: ParticipantStatus.INSCRIT })
    statut!: ParticipantStatus;

    @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
    score!: number | null;

    @CreateDateColumn()
    date_joined!: Date;

    @Column({ type: 'datetime', nullable: true })
    date_completed!: Date | null;

    @ManyToOne(() => Session, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'session_id' })
    session!: Session;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'etudiant_id' })
    etudiant!: User;
}