import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
import path from "path";

// chemins relatifs depuis src/config/data-source.ts vers src/app/models
import { EtudiantProfil } from "../app/models/EtudiantProfil";
import { ProfesseurProfil } from "../app/models/ProfesseurProfil";
import { User } from "../app/models/User";
import { Classe } from "../app/models/Classe";
import { Filiere } from "../app/models/Filiere";
import { Ecole } from "../app/models/Ecole";
import { Question } from "../app/models/Question";
import { Session } from "../app/models/Session";
import { SessionParticipant } from "../app/models/SessionParticipant";
import { ReponseEtudiant } from "../app/models/ReponseEtudiant";

dotenv.config();

const AppDataSource = new DataSource({
    type: "mysql",
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
    synchronize: false,
    logging: true, // Met true pour voir les erreurs
    entities: [EtudiantProfil, ProfesseurProfil, User, Classe, Filiere, Ecole,Question,Session,SessionParticipant,ReponseEtudiant],
    migrations: ["src/app/migrations/*.ts"],
    subscribers: [],
});

export default AppDataSource;