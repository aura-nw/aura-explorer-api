import { MigrationInterface, QueryRunner } from 'typeorm';

export class addTotalToUserActivity1697788115636 implements MigrationInterface {
  name = 'addTotalToUserActivity1697788115636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` ADD \`total\` int NULL DEFAULT '0'`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`user_activity\` DROP COLUMN \`total\``,
    );
  }
}
