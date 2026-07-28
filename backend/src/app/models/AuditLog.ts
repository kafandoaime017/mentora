import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn
} from 'typeorm'

// Pas de relations FK vers User/Ecole : on snapshot le nom/rôle au moment de
// l'action pour que le log reste lisible même si l'utilisateur est supprimé.
@Entity('audit_logs')
export class AuditLog {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number

    @Column({ type: 'int', unsigned: true, nullable: true })
    ecole_id!: number | null

    @Column({ type: 'int', unsigned: true, nullable: true })
    user_id!: number | null

    @Column({ type: 'varchar', length: 150, default: '' })
    user_nom!: string

    @Column({ type: 'varchar', length: 30, default: '' })
    user_role!: string

    @Column({ type: 'varchar', length: 100 })
    action!: string

    @Column({ type: 'varchar', length: 50, nullable: true })
    cible_type!: string | null

    @Column({ type: 'int', nullable: true })
    cible_id!: number | null

    @Column({ type: 'json', nullable: true })
    details!: any

    @Column({ type: 'varchar', length: 45, nullable: true })
    ip_address!: string | null

    @CreateDateColumn()
    created_at!: Date
}
