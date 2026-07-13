import { MigrationInterface, QueryRunner } from "typeorm"

// Permet de créer des invitations de type "superadmin" (qui n'ont pas d'école
// rattachée) : la colonne ecoleId devient nullable et le rôle "superadmin" est
// ajouté à l'enum de la colonne role.
export class MakeInvitationEcoleIdNullableAndAddSuperadminRole1783948156286 implements MigrationInterface {
    name = 'MakeInvitationEcoleIdNullableAndAddSuperadminRole1783948156286'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY \`role\` enum('etudiant','professeur','directeur','superadmin') NOT NULL`)
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY \`ecoleId\` int unsigned NULL`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY \`ecoleId\` int unsigned NOT NULL`)
        await queryRunner.query(`ALTER TABLE \`invitations\` MODIFY \`role\` enum('etudiant','professeur','directeur') NOT NULL`)
    }
}
