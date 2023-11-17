import { MigrationInterface, QueryRunner } from 'typeorm';

export class addLastRequiredLoginToUser1691651376369
  implements MigrationInterface
{
  name = 'addLastRequiredLoginToUser1691651376369';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` ADD \`last_required_login\` datetime NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user\` DROP COLUMN \`last_required_login\``,
    );
  }
}
