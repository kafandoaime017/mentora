import { MigrationInterface, QueryRunner } from "typeorm"

// Ajoute :
// - annonces + annonce_interactions (annonces de l'école + sondages)
// - audit_logs (journal d'audit pour le directeur)
// - colonnes de détection de triche basique (changement d'onglet, temps de réponse)
export class AddAnnoncesAuditLogsCheatDetection1784115686955 implements MigrationInterface {
    name = 'AddAnnoncesAuditLogsCheatDetection1784115686955'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ─── Annonces de l'école / sondages ───────────────────────────────────
        await queryRunner.query(`CREATE TABLE \`annonces\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`ecole_id\` int UNSIGNED NOT NULL,
            \`auteur_id\` int UNSIGNED NOT NULL,
            \`titre\` varchar(255) NOT NULL,
            \`contenu\` text NOT NULL,
            \`type\` enum ('info', 'sondage') NOT NULL DEFAULT 'info',
            \`obligatoire\` tinyint NOT NULL DEFAULT 0,
            \`options\` json NULL,
            \`cible_type\` enum ('tous', 'filiere', 'classe', 'professeurs') NOT NULL DEFAULT 'tous',
            \`cible_filiere_id\` int UNSIGNED NULL,
            \`cible_classe_id\` int UNSIGNED NULL,
            \`actif\` tinyint NOT NULL DEFAULT 1,
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`)
        ) ENGINE=InnoDB`)

        await queryRunner.query(`ALTER TABLE \`annonces\` ADD CONSTRAINT \`FK_annonce_ecole\` FOREIGN KEY (\`ecole_id\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`annonces\` ADD CONSTRAINT \`FK_annonce_auteur\` FOREIGN KEY (\`auteur_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`annonces\` ADD CONSTRAINT \`FK_annonce_filiere\` FOREIGN KEY (\`cible_filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`annonces\` ADD CONSTRAINT \`FK_annonce_classe\` FOREIGN KEY (\`cible_classe_id\`) REFERENCES \`classes\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)

        await queryRunner.query(`CREATE TABLE \`annonce_interactions\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`annonce_id\` int UNSIGNED NOT NULL,
            \`user_id\` int UNSIGNED NOT NULL,
            \`vue\` tinyint NOT NULL DEFAULT 0,
            \`vue_at\` datetime NULL,
            \`option_choisie\` int NULL,
            \`repondu_at\` datetime NULL,
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`),
            UNIQUE KEY \`UQ_annonce_interaction_annonce_user\` (\`annonce_id\`, \`user_id\`)
        ) ENGINE=InnoDB`)

        await queryRunner.query(`ALTER TABLE \`annonce_interactions\` ADD CONSTRAINT \`FK_interaction_annonce\` FOREIGN KEY (\`annonce_id\`) REFERENCES \`annonces\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`annonce_interactions\` ADD CONSTRAINT \`FK_interaction_user\` FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)

        // ─── Logs d'audit ──────────────────────────────────────────────────────
        await queryRunner.query(`CREATE TABLE \`audit_logs\` (
            \`id\` int UNSIGNED NOT NULL AUTO_INCREMENT,
            \`ecole_id\` int UNSIGNED NULL,
            \`user_id\` int UNSIGNED NULL,
            \`user_nom\` varchar(150) NOT NULL DEFAULT '',
            \`user_role\` varchar(30) NOT NULL DEFAULT '',
            \`action\` varchar(100) NOT NULL,
            \`cible_type\` varchar(50) NULL,
            \`cible_id\` int NULL,
            \`details\` json NULL,
            \`ip_address\` varchar(45) NULL,
            \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
            PRIMARY KEY (\`id\`),
            KEY \`IDX_audit_logs_ecole_id\` (\`ecole_id\`),
            KEY \`IDX_audit_logs_created_at\` (\`created_at\`)
        ) ENGINE=InnoDB`)

        // ─── Détection de triche basique ──────────────────────────────────────
        await queryRunner.query(`ALTER TABLE \`session_participants\` ADD \`nb_changements_onglet\` int NOT NULL DEFAULT 0`)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD \`temps_reponse_ms\` int NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP COLUMN \`temps_reponse_ms\``)
        await queryRunner.query(`ALTER TABLE \`session_participants\` DROP COLUMN \`nb_changements_onglet\``)

        await queryRunner.query(`DROP TABLE \`audit_logs\``)

        await queryRunner.query(`ALTER TABLE \`annonce_interactions\` DROP FOREIGN KEY \`FK_interaction_user\``)
        await queryRunner.query(`ALTER TABLE \`annonce_interactions\` DROP FOREIGN KEY \`FK_interaction_annonce\``)
        await queryRunner.query(`DROP TABLE \`annonce_interactions\``)

        await queryRunner.query(`ALTER TABLE \`annonces\` DROP FOREIGN KEY \`FK_annonce_classe\``)
        await queryRunner.query(`ALTER TABLE \`annonces\` DROP FOREIGN KEY \`FK_annonce_filiere\``)
        await queryRunner.query(`ALTER TABLE \`annonces\` DROP FOREIGN KEY \`FK_annonce_auteur\``)
        await queryRunner.query(`ALTER TABLE \`annonces\` DROP FOREIGN KEY \`FK_annonce_ecole\``)
        await queryRunner.query(`DROP TABLE \`annonces\``)
    }
}
