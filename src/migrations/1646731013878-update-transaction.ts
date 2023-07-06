import { MigrationInterface, QueryRunner } from 'typeorm';

export class updateTransaction1646731013878 implements MigrationInterface {
  name = 'updateTransaction1646731013878';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE \`transactions\` ADD \`fee\` text NOT NULL`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE \`transactions\` DROP COLUMN \`fee\``);
  }
}
