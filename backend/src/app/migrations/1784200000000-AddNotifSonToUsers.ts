import { MigrationInterface, QueryRunner } from "typeorm"

// Préférence de son de notification (cloche en temps réel) : activation on/off
// et éventuel fichier son personnalisé uploadé par l'utilisateur.
export class AddNotifSonToUsers1784200000000 implements MigrationInterface {
    name = 'AddNotifSonToUsers1784200000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`notif_son_actif\` tinyint NOT NULL DEFAULT 1`)
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`notif_son_url\` varchar(500) NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`notif_son_url\``)
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`notif_son_actif\``)
    }
}
