import { MigrationInterface, QueryRunner } from "typeorm"

// La colonne `resultats_visibles` existe sur l'entité Session (contrôle si
// l'étudiant peut voir sa note) mais n'avait jamais été ajoutée par une
// migration — elle n'existait que via `synchronize`. Sans cette migration,
// une base de données créée uniquement à partir des migrations n'a pas cette
// colonne alors que le code applicatif (contrôleurs, requêtes TypeORM) s'y
// attend.
export class AddResultatsVisiblesToSessions1784300000000 implements MigrationInterface {
    name = 'AddResultatsVisiblesToSessions1784300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` ADD \`resultats_visibles\` tinyint NOT NULL DEFAULT 0`)
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE \`sessions\` DROP COLUMN \`resultats_visibles\``)
    }
}
