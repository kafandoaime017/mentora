import { MigrationInterface, QueryRunner } from "typeorm";

// DEAD FILE — à supprimer (git rm backend/src/migrations/1775551908504-AddResetPasswordFieldsToUsers.ts).
// Ce fichier vit hors de `backend/src/app/migrations/`, le seul dossier
// référencé par le glob `migrations` de data-source.ts : il n'a donc jamais
// été exécuté et son up()/down() est vide (no-op). La vraie migration pour
// resetPasswordToken/resetPasswordExpires est
// `backend/src/app/migrations/1775551972291-AddResetPasswordFields.ts`.
// Conservé tel quel (au lieu d'être vidé) pour ne rien casser en attendant
// que ce fichier soit supprimé manuellement du dépôt.
export class AddResetPasswordFieldsToUsers1775551908504 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
    }

}
