import {
    Entity, PrimaryGeneratedColumn, Column,
    CreateDateColumn, ManyToOne, JoinColumn
} from 'typeorm';
import { Ecole } from './Ecole';
import { User } from './User';
import { Filiere } from './Filiere';
import { QuestionType } from './Question';

export enum QuestionDifficulte {
    FACILE = 'facile',
    MOYEN = 'moyen',
    DIFFICILE = 'difficile'
}

// Banque de questions réutilisable : un professeur peut y piocher des
// questions déjà rédigées au lieu de les ressaisir à chaque session.
@Entity('questions_banque')
export class QuestionBanque {
    @PrimaryGeneratedColumn({ type: 'int', unsigned: true })
    id!: number;

    @Column({ type: 'int', unsigned: true })
    ecole_id!: number;

    @Column({ type: 'int', unsigned: true })
    professeur_id!: number;

    @Column({ type: 'int', unsigned: true, nullable: true })
    filiere_id!: number | null;

    @Column({ type: 'text' })
    texte!: string;

    @Column({ type: 'enum', enum: QuestionType, default: QuestionType.QCM })
    type!: QuestionType;

    @Column({ type: 'int', default: 1 })
    points!: number;

    @Column({ type: 'json', nullable: true })
    options!: any;

    @Column({ type: 'json', nullable: true })
    reponses_correctes!: number[];

    @Column({ type: 'text', nullable: true })
    reponse_indicative!: string | null;

    @Column({ type: 'varchar', length: 100, nullable: true })
    theme!: string | null;

    @Column({ type: 'enum', enum: QuestionDifficulte, default: QuestionDifficulte.MOYEN })
    difficulte!: QuestionDifficulte;

    @ManyToOne(() => Ecole, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'ecole_id' })
    ecole!: Ecole;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'professeur_id' })
    professeur!: User;

    @ManyToOne(() => Filiere, { onDelete: 'SET NULL', nullable: true })
    @JoinColumn({ name: 'filiere_id' })
    filiere!: Filiere | null;

    @CreateDateColumn()
    created_at!: Date;
}
