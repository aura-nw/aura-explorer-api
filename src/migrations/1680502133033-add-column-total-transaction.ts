import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnTotalTransaction1680502133033
  implements MigrationInterface
{
  name = 'addColumnTotalTransaction1680502133033';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` ADD \`total_tx\` int NOT NULL DEFAULT 0`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`smart_contracts\` DROP COLUMN \`total_tx\``,
    );
  }
}
