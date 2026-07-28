import { MigrationInterface, QueryRunner } from "typeorm";

export class InvitationDirecteurSupport1783938782005 implements MigrationInterface {
    name = 'InvitationDirecteurSupport1783938782005'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Un directeur est rattaché à toute l'école, pas à une filière précise
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY COLUMN \`filiereId\` int UNSIGNED NULL`);
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY COLUMN \`role\` enum ('etudiant', 'professeur', 'directeur') NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY COLUMN \`role\` enum ('etudiant', 'professeur') NOT NULL`);
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY COLUMN \`filiereId\` int UNSIGNED NOT NULL`);
    }

}
