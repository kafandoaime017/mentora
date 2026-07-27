import { MigrationInterface, QueryRunner } from "typeorm"

// Migration de base : crée les tables fondatrices (ecoles, filieres, classes,
// users, etudiant_profils, professeur_profils, invitations, notifications)
// qui, historiquement, n'ont JAMAIS été créées par une migration — elles
// n'existaient que parce que la toute première base de données du projet a
// été démarrée avec `synchronize: true` (voir commentaire dans data-source.ts).
// Sur un clone fresh (base vide + `migration:run`), toutes les migrations
// suivantes qui font des `ALTER TABLE` sur ces tables échouaient donc avec
// "table doesn't exist" : c'est la cause des "problèmes de migrations" au
// premier lancement en local.
//
// `CREATE TABLE IF NOT EXISTS` rend cette migration sans effet sur une base
// déjà bootstrappée via synchronize (les tables existent déjà, rien n'est
// modifié) : elle est donc sûre à exécuter aussi bien sur une base neuve que
// sur une base de prod existante.
//
// Les colonnes ajoutées plus tard par d'autres migrations (adresse/telephone
// sur ecoles, verificationCode*, resetPassword*, notif_son_* sur users) sont
// volontairement exclues d'ici pour laisser ces migrations les ajouter dans
// l'ordre, sans conflit de colonne déjà existante. De même, `invitations.role`,
// `.filiereId` et `.ecoleId` sont créés dans leur état d'origine (avant les
// `MODIFY COLUMN` des migrations InvitationDirecteurSupport et
// MakeInvitationEcoleIdNullableAndAddSuperadminRole).
export class InitialSchema1775000000000 implements MigrationInterface {
    name = 'InitialSchema1775000000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`ecoles\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`nom\` varchar(200) NOT NULL,
            \`ville\` varchar(100) NULL,
            \`logo\` varchar(500) NULL,
            \`isActive\` tinyint NOT NULL DEFAULT 1,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`plan\` enum ('gratuit', 'starter', 'pro') NOT NULL DEFAULT 'gratuit',
            \`plan_expire_at\` datetime NULL,
            \`stripe_customer_id\` varchar(255) NULL,
            \`stripe_subscription_id\` varchar(255) NULL,
            UNIQUE INDEX \`UQ_ecoles_nom\` (\`nom\`),
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`filieres\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`nom\` varchar(150) NOT NULL,
            \`isActive\` tinyint NOT NULL DEFAULT 1,
            \`ecoleId\` int UNSIGNED NOT NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_filieres_ecole\` FOREIGN KEY (\`ecoleId\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`classes\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`nom\` varchar(50) NOT NULL,
            \`isActive\` tinyint NOT NULL DEFAULT 1,
            \`filiereId\` int UNSIGNED NOT NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`codeInscription\` varchar(20) NULL,
            UNIQUE INDEX \`UQ_classes_codeInscription\` (\`codeInscription\`),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_classes_filiere\` FOREIGN KEY (\`filiereId\`) REFERENCES \`filieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`users\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`nom\` varchar(100) NOT NULL,
            \`prenom\` varchar(100) NOT NULL,
            \`email\` varchar(255) NOT NULL,
            \`motDePasse\` varchar(255) NULL,
            \`role\` enum ('etudiant', 'professeur', 'directeur', 'superadmin') NOT NULL,
            \`googleId\` varchar(255) NULL,
            \`avatar\` varchar(500) NULL,
            \`isVerified\` tinyint NOT NULL DEFAULT 0,
            \`isActive\` tinyint NOT NULL DEFAULT 1,
            \`ecoleId\` int UNSIGNED NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            \`updatedAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
            \`totpEnabled\` tinyint NOT NULL DEFAULT 0,
            \`totpSecret\` varchar(255) NULL,
            \`notif_nouvelle_session\` tinyint NOT NULL DEFAULT 1,
            \`notif_session_demarree\` tinyint NOT NULL DEFAULT 1,
            \`notif_notes_publiees\` tinyint NOT NULL DEFAULT 1,
            UNIQUE INDEX \`UQ_users_email\` (\`email\`),
            UNIQUE INDEX \`UQ_users_googleId\` (\`googleId\`),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_users_ecole\` FOREIGN KEY (\`ecoleId\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`etudiant_profils\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`dateNaissance\` date NULL,
            \`userId\` int UNSIGNED NOT NULL,
            \`ecoleId\` int UNSIGNED NULL,
            \`filiereId\` int UNSIGNED NULL,
            \`classeId\` int UNSIGNED NULL,
            UNIQUE INDEX \`UQ_etudiant_profils_userId\` (\`userId\`),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_etudiant_profils_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT \`FK_etudiant_profils_ecole\` FOREIGN KEY (\`ecoleId\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
            CONSTRAINT \`FK_etudiant_profils_filiere\` FOREIGN KEY (\`filiereId\`) REFERENCES \`filieres\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
            CONSTRAINT \`FK_etudiant_profils_classe\` FOREIGN KEY (\`classeId\`) REFERENCES \`classes\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`professeur_profils\` (
            \`id\` int NOT NULL AUTO_INCREMENT,
            \`matiere\` varchar(150) NULL,
            \`telephone\` varchar(20) NULL,
            \`userId\` int UNSIGNED NOT NULL,
            \`ecoleId\` int UNSIGNED NULL,
            \`statut\` enum ('pending', 'active') NOT NULL DEFAULT 'pending',
            \`filiereId\` int UNSIGNED NULL,
            UNIQUE INDEX \`UQ_professeur_profils_userId\` (\`userId\`),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_professeur_profils_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT \`FK_professeur_profils_ecole\` FOREIGN KEY (\`ecoleId\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
            CONSTRAINT \`FK_professeur_profils_filiere\` FOREIGN KEY (\`filiereId\`) REFERENCES \`filieres\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`invitations\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`email\` varchar(255) NOT NULL,
            \`nom\` varchar(100) NOT NULL,
            \`prenom\` varchar(100) NOT NULL,
            \`token\` varchar(255) NOT NULL,
            \`role\` enum ('etudiant', 'professeur') NOT NULL,
            \`classeId\` int UNSIGNED NULL,
            \`filiereId\` int UNSIGNED NOT NULL,
            \`ecoleId\` int UNSIGNED NOT NULL,
            \`used\` tinyint NOT NULL DEFAULT 0,
            \`expiresAt\` datetime NOT NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            UNIQUE INDEX \`UQ_invitations_token\` (\`token\`),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_invitations_classe\` FOREIGN KEY (\`classeId\`) REFERENCES \`classes\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION,
            CONSTRAINT \`FK_invitations_filiere\` FOREIGN KEY (\`filiereId\`) REFERENCES \`filieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION,
            CONSTRAINT \`FK_invitations_ecole\` FOREIGN KEY (\`ecoleId\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)

        await queryRunner.query(`CREATE TABLE IF NOT EXISTS \`notifications\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`userId\` int UNSIGNED NOT NULL,
            \`titre\` varchar(255) NOT NULL,
            \`message\` text NOT NULL,
            \`type\` enum ('new_session', 'session_started', 'session_completed', 'student_submitted') NOT NULL,
            \`isRead\` tinyint NOT NULL DEFAULT 0,
            \`link\` varchar(500) NULL,
            \`sessionId\` int UNSIGNED NULL,
            \`createdAt\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`),
            CONSTRAINT \`FK_notifications_user\` FOREIGN KEY (\`userId\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION
        ) ENGINE=InnoDB`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE IF EXISTS \`notifications\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`invitations\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`professeur_profils\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`etudiant_profils\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`users\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`classes\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`filieres\``)
        await queryRunner.query(`DROP TABLE IF EXISTS \`ecoles\``)
    }
}
