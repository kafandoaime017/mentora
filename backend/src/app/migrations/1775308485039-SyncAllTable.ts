import { MigrationInterface, QueryRunner } from "typeorm";

export class SyncAllTable1775308485039 implements MigrationInterface {
    name = 'SyncAllTable1775308485039'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCode\` varchar(6) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`verificationCodeExpires\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCodeExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`verificationCode\``);
    }

}
