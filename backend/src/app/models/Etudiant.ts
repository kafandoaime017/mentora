import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Etudiant {
    @PrimaryGeneratedColumn()
    id!: number; 

    @Column()
    nom!: string;

    @Column()
    prenom!: string;

    @Column()
    email!: string;
}