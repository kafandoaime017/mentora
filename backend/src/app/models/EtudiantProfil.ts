import {
    Entity, PrimaryGeneratedColumn, Column,
    OneToOne, JoinColumn, ManyToOne,
} from 'typeorm';
import { User } from './User';
import { Ecole } from './Ecole';
import { Filiere } from './Filiere';
import { Classe } from './Classe';

@Entity('etudiant_profils')
export class EtudiantProfil {
    @PrimaryGeneratedColumn('increment')
    id!: number;

    @Column({ type: 'date', nullable: true })
    dateNaissance!: string | null;

    @Column({ type: 'int', unsigned: true, unique: true })
    userId!: number;

    @OneToOne(() => User, (user) => user.etudiantProfil, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userId' })
    user!: User;

    @Column({ type: 'int', unsigned: true, nullable: true })
    ecoleId!: number | null;

    @ManyToOne(() => Ecole, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'ecoleId' })
    ecole!: Ecole | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    filiereId!: number | null;

    @ManyToOne(() => Filiere, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'filiereId' })
    filiere!: Filiere | null;

    @Column({ type: 'int', unsigned: true, nullable: true })
    classeId!: number | null;

    @ManyToOne(() => Classe, { nullable: true, onDelete: 'SET NULL' })
    @JoinColumn({ name: 'classeId' })
    classe!: Classe | null;

}