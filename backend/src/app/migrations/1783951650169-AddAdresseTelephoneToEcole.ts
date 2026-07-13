import { MigrationInterface, QueryRunner } from "typeorm"

// Ajoute l'adresse et le numéro de téléphone de l'école (utilisés pour
// la fiche établissement côté superadmin/directeur).
export class AddAdresseTelephoneToEcole1783951650169 implements MigrationInterface {
    name = 'AddAdresseTelephoneToEcole1783951650169'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ecoles\` ADD \`adresse\` varchar(500) NULL`)
        await queryRunner.query(`ALTER TABLE \`ecoles\` ADD \`telephone\` varchar(30) NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`ecoles\` DROP COLUMN \`telephone\``)
        await queryRunner.query(`ALTER TABLE \`ecoles\` DROP COLUMN \`adresse\``)
    }
}
