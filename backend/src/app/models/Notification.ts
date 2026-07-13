// src/app/models/Notification.ts
import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm'
import { User } from './User'

export enum NotificationType {
    NEW_SESSION      = 'new_session',
    SESSION_STARTED  = 'session_started',
    SESSION_COMPLETED = 'session_completed',
    STUDENT_SUBMITTED = 'student_submitted',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number

    @Column({ type: 'int', unsigned: true })
    userId!: number

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User

    @Column({ type: 'varchar', length: 255 })
    titre!: string

    @Column({ type: 'text' })
    message!: string

    @Column({ type: 'enum', enum: NotificationType })
    type!: NotificationType

    @Column({ type: 'boolean', default: false })
    isRead!: boolean

    @Column({ type: 'varchar', length: 500, nullable: true })
    link!: string | null

    @Column({ type: 'int', unsigned: true, nullable: true })
    sessionId!: number | null

    @CreateDateColumn()
    createdAt!: Date
}