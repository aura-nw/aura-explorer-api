import { MigrationInterface, QueryRunner } from 'typeorm';

export class addIsFavoriteColumn1692699242541 implements MigrationInterface {
  name = 'addIsFavoriteColumn1692699242541';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` ADD \`is_favorite\` tinyint NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`private_name_tag\` DROP COLUMN \`is_favorite\``,
    );
  }
}
