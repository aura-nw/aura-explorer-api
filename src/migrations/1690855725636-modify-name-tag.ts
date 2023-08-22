import { MigrationInterface, QueryRunner } from 'typeorm';

export class modifyNameTag1690855725636 implements MigrationInterface {
  name = 'modifyNameTag1690855725636';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` DROP COLUMN \`deleted_at\``,
    );
    await queryRunner.query(
      `ALTER TABLE \`name_tag\` RENAME TO \`public_name_tag\``,
    );
  }

  public async down(): Promise<void> {
    // No action.
  }
}
