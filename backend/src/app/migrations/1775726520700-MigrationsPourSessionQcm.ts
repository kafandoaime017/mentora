import { MigrationInterface, QueryRunner } from "typeorm";

export class MigrationsPourSessionQcm1775726520700 implements MigrationInterface {
    name = 'MigrationsPourSessionQcm1775726520700'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE \`session_participants\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`session_id\` int UNSIGNED NOT NULL, \`etudiant_id\` int UNSIGNED NOT NULL, \`statut\` enum ('inscrit', 'present', 'absent', 'termine') NOT NULL DEFAULT 'inscrit', \`score\` decimal(5,2) NULL, \`date_joined\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`date_completed\` datetime NULL, PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`sessions\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`titre\` varchar(255) NOT NULL, \`description\` text NULL, \`theme\` varchar(100) NULL, \`code\` varchar(10) NOT NULL, \`qr_code\` text NULL, \`date_debut\` datetime NOT NULL, \`date_fin\` datetime NOT NULL, \`duree\` int NOT NULL, \`classe_id\` int UNSIGNED NOT NULL, \`filiere_id\` int UNSIGNED NOT NULL, \`created_by\` int UNSIGNED NOT NULL, \`status\` enum ('draft', 'pending', 'active', 'completed', 'cancelled') NOT NULL DEFAULT 'draft', \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), \`updated_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6), UNIQUE INDEX \`IDX_284f9d463eabac923884ec4a86\` (\`code\`), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`questions\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`session_id\` int UNSIGNED NOT NULL, \`texte\` text NOT NULL, \`type\` enum ('qcm', 'qcm_multiple', 'vrai_faux') NOT NULL DEFAULT 'qcm', \`points\` int NOT NULL DEFAULT '1', \`ordre\` int NOT NULL, \`options\` json NULL, \`reponses_correctes\` json NULL, \`created_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`CREATE TABLE \`reponses_etudiants\` (\`id\` int UNSIGNED NOT NULL AUTO_INCREMENT, \`session_id\` int UNSIGNED NOT NULL, \`etudiant_id\` int UNSIGNED NOT NULL, \`question_id\` int UNSIGNED NOT NULL, \`reponse_ids\` json NULL, \`est_correcte\` tinyint NOT NULL DEFAULT 0, \`submitted_at\` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (\`id\`)) ENGINE=InnoDB`);
        await queryRunner.query(`ALTER TABLE \`session_participants\` ADD CONSTRAINT \`FK_0f44aaaaf807cef66c6fa9494a8\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`session_participants\` ADD CONSTRAINT \`FK_9a758105000289ed615c3c25e97\` FOREIGN KEY (\`etudiant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_b7b1ce185bf9ebf83558386bc07\` FOREIGN KEY (\`classe_id\`) REFERENCES \`classes\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_b5064fc1bb3c7869d8ca4b69844\` FOREIGN KEY (\`filiere_id\`) REFERENCES \`filieres\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD CONSTRAINT \`FK_7a1091a6fc423e6af88ce9b7105\` FOREIGN KEY (\`created_by\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`questions\` ADD CONSTRAINT \`FK_6a122873055961342d11ea9e3eb\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD CONSTRAINT \`FK_ef81ac7af7d7f1f64c2b4c0e1f5\` FOREIGN KEY (\`session_id\`) REFERENCES \`sessions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD CONSTRAINT \`FK_f1c03e19010475ecbb898ac729a\` FOREIGN KEY (\`etudiant_id\`) REFERENCES \`users\`(\`id\`) ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` ADD CONSTRAINT \`FK_39544ea9a8ec367b06354934e85\` FOREIGN KEY (\`question_id\`) REFERENCES \`questions\`(\`id\`) ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP FOREIGN KEY \`FK_39544ea9a8ec367b06354934e85\``);
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP FOREIGN KEY \`FK_f1c03e19010475ecbb898ac729a\``);
        await queryRunner.query(`ALTER TABLE \`reponses_etudiants\` DROP FOREIGN KEY \`FK_ef81ac7af7d7f1f64c2b4c0e1f5\``);
        await queryRunner.query(`ALTER TABLE \`questions\` DROP FOREIGN KEY \`FK_6a122873055961342d11ea9e3eb\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_7a1091a6fc423e6af88ce9b7105\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_b5064fc1bb3c7869d8ca4b69844\``);
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP FOREIGN KEY \`FK_b7b1ce185bf9ebf83558386bc07\``);
        await queryRunner.query(`ALTER TABLE \`session_participants\` DROP FOREIGN KEY \`FK_9a758105000289ed615c3c25e97\``);
        await queryRunner.query(`ALTER TABLE \`session_participants\` DROP FOREIGN KEY \`FK_0f44aaaaf807cef66c6fa9494a8\``);
        await queryRunner.query(`DROP TABLE \`reponses_etudiants\``);
        await queryRunner.query(`DROP TABLE \`questions\``);
        await queryRunner.query(`DROP INDEX \`IDX_284f9d463eabac923884ec4a86\` ON \`sessions\``);
        await queryRunner.query(`DROP TABLE \`sessions\``);
        await queryRunner.query(`DROP TABLE \`session_participants\``);
    }

}
