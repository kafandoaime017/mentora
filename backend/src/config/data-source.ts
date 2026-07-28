import "reflect-metadata";
import { DataSource, DataSourceOptions } from "typeorm";
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
import { Notification } from '../app/models/Notification'
import { Invitation } from "../app/models/Invitation";
import { QuestionBanque } from "../app/models/QuestionBanque";
import { Annonce } from "../app/models/Annonce";
import { AnnonceInteraction } from "../app/models/AnnonceInteraction";
import { AuditLog } from "../app/models/AuditLog";


dotenv.config();

const entities = [EtudiantProfil, ProfesseurProfil, User, Classe, Filiere, Ecole, Question, Session, SessionParticipant, ReponseEtudiant, Notification, Invitation, QuestionBanque, Annonce, AnnonceInteraction, AuditLog];

// En environnement de test (Jest force NODE_ENV=test), on utilise une base
// SQLite en memoire (via sql.js, pur JS/WASM, sans compilation native) au lieu
// de MySQL : pas besoin de service DB externe en CI, chaque suite de tests
// demarre avec un schema vierge et isole (synchronize:true). Le comportement
// dev/prod (MySQL) n'est jamais impacte par cette branche.
const options: DataSourceOptions = process.env.NODE_ENV === 'test'
    ? {
        type: "sqljs",
        autoSave: false,
        dropSchema: true,
        synchronize: true,
        logging: false,
        entities,
    }
    : {
        type: "mysql",
        host: process.env.DB_HOST,
        port: Number(process.env.DB_PORT),
        username: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DB_NAME,
        // DB_SYNCHRONIZE=true : uniquement pour bootstrap ponctuel d'un schéma
        // vide (aucune migration de ce projet ne crée le schéma de base — la
        // toute première ne fait que des ALTER sur des tables supposées déjà
        // exister). Ne jamais laisser cette variable active en usage normal.
        synchronize: process.env.DB_SYNCHRONIZE === 'true',
        logging: true, // Met true pour voir les erreurs
        entities,
        // .ts pour "npm run migration:run" (execute via ts-node sur les sources),
        // .js pour le serveur compile (dist/) en production
        migrations: [__dirname + "/../app/migrations/*.{js,ts}"],
        subscribers: [],
    };

const AppDataSource = new DataSource(options);

export default AppDataSource;
