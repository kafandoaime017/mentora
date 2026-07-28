import { MigrationInterface, QueryRunner } from "typeorm"

// Ajoute :
// - 3 nouveaux types de questions (texte_libre, appariement, fichier)
// - les colonnes nécessaires à la correction manuelle sur reponses_etudiants
// - une colonne reponse_indicative sur questions (repère du prof pour corriger)
// - la table questions_banque (banque de questions réutilisable)
export class AddQuestionBankAndNewQuestionTypes1784113708470 implements MigrationInterface {
    name = 'AddQuestionBankAndNewQuestionTypes1784113708470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // ─── Nouveaux types de questions ──────────────────────────────────────
        await queryRunner.query(`ALTER TABLE \`questions\` MODIFY COLUMN \`type\` enum ('qcm', 'qcm_multiple', 'vrai_faux', 'texte_libre', 'appariement', 'fichier') NOT NULL DEFAULT 'qcm'`)
        await queryRunner.query(`ALTER TABLE \`questions\` ADD \`reponse_indicative\` text NULL`)

        // ─── Correction manuelle (texte_libre / fichier) ──────────────────────
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD \`reponse_texte\` text NULL`)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD \`reponse_fichier\` varchar(500) NULL`)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD \`note_manuelle\` int NULL`)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD \`corrige_manuellement\` tinyint NOT NULL DEFAULT 0`)

        // ─── Banque de questions réutilisable ─────────────────────────────────
        await queryRunner.query(`CREATE TABLE \`questions_banque\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`ecole_id\` int UNSIGNED NOT NULL, \`professeur_id\` int UNSIGNED NOT NULL, \`filiere_id\` int UNSIGNED NULL, \`texte\` text NOT NULL, \`type\` enum ('qcm', 'qcm_multiple', 'vrai_faux', 'texte_libre', 'appariement', 'fichier') NOT NULL DEFAULT 'qcm', \`points\` int NOT NULL DEFAULT '1', \`options\` json NULL, \`reponses_correctes\` json NULL, \`reponse_indicative\` text NULL, \`theme\` varchar(100) NULL, \`difficulte\` enum ('facile', 'moyen', 'difficile') NOT NULL DEFAULT 'moyen', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`)
        await queryRunner.query(`ALTER TABLE \`questions_banque\` ADD CONSTRAINT \`FK_qbanque_ecole\` FOREIGN KEY (\`ecole_id\`) REFERENCES \`ecoles\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`questions_banque\` ADD CONSTRAINT \`FK_qbanque_professeur\` FOREIGN KEY (\`professeur_id\`) REFERENCES \`users\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`)
        await queryRunner.query(`ALTER TABLE \`questions_banque\` ADD CONSTRAINT \`FK_qbanque_filiere\` FOREIGN KEY (\`filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE SET NULL ON UPDATE NO ACTION`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`questions_banque\` DROP FOREIGN KEY \`FK_qbanque_filiere\``)
        await queryRunner.query(`ALTER TABLE \`questions_banque\` DROP FOREIGN KEY \`FK_qbanque_professeur\``)
        await queryRunner.query(`ALTER TABLE \`questions_banque\` DROP FOREIGN KEY \`FK_qbanque_ecole\``)
        await queryRunner.query(`DROP TABLE \`questions_banque\``)

        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP COLUMN \`corrige_manuellement\``)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP COLUMN \`note_manuelle\``)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP COLUMN \`reponse_fichier\``)
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP COLUMN \`reponse_texte\``)

        await queryRunner.query(`ALTER TABLE \`questions\` DROP COLUMN \`reponse_indicative\``)
        await queryRunner.query(`ALTER TABLE \`questions\` MODIFY COLUMN \`type\` enum ('qcm', 'qcm_multiple', 'vrai_faux') NOT NULL DEFAULT 'qcm'`)
    }
}
