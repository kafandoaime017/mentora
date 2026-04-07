import { MigrationInterface, QueryRunner } from "typeorm";

export class AjoutResetPasswordFields1775397815759 implements MigrationInterface {
    name = 'AjoutResetPasswordFields1775397815759'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetToken\` varchar(255) NULL`);
        await queryRunner.query(`ALTER TABLE \`users\` ADD \`resetTokenExpires\` datetime NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetTokenExpires\``);
        await queryRunner.query(`ALTER TABLE \`users\` DROP COLUMN \`resetToken\``);
    }

}
