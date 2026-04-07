import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToOne, JoinColumn, ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Ecole } from './Ecole';

@Entity('professeur_profils')
export class ProfesseurProfil {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'varchar', length: 150, nullable: true })
    matiere!: string | null;

    @Column({ type: 'varchar', length: 20, nullable: true })
    telephone!: string | null;

    // ─── Relation User ────────────────────────────────────────────────────────
    @Column({ type: 'int', unsigned: true, unique: true })
    userId!: number;

    @OneToOne(() => User, (user) => user.professeurProfil, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    // ─── École rattachée ──────────────────────────────────────────────────────
    @Column({ type: 'int', unsigned: true, nullable: true })
    ecoleId!: number | null;

    @ManyToOne(() => Ecole, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ecoleId' })
    ecole!: Ecole | null;
}