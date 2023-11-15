import { MigrationInterface, QueryRunner } from 'typeorm';

export class addColumnHeightNotification1700015184902
  implements MigrationInterface
{
  name = 'addColumnHeightNotification1700015184902';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` ADD \`height\` int NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`notification\` DROP COLUMN \`height\``,
    );
  }
}
